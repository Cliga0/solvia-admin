import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import * as crypto from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";
import { toDataURL } from "qrcode";
import { PrismaService } from "@/prisma/prisma.service";
import { AuthCryptoService } from "./auth-crypto.service";
import { JwtTokenService } from "./jwt/jwt.service";
import { AuditService } from "../audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import {
  DisableTwoFactorDto,
  LoginResponseDto,
  TwoFactorSetupResponseDto,
  VerifyTwoFactorDto,
  VerifyTwoFactorLoginDto,
} from "./dto";

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_BYTES = 8;

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: AuthCryptoService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly auditService: AuditService,
  ) {}

  async setup(userId: string): Promise<TwoFactorSetupResponseDto> {
    const user = await this.prisma.internalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException("2FA is already enabled");
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: "Solvia Admin",
      label: user.email,
      secret,
    });

    await this.prisma.internalUser.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeDataUrl = await toDataURL(otpauthUrl);

    return { otpauthUrl, qrCodeDataUrl };
  }

  async verifySetup(
    userId: string,
    dto: VerifyTwoFactorDto,
  ): Promise<{ backupCodes: string[] }> {
    const user = await this.prisma.internalUser.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException("2FA setup not initiated");
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException("2FA is already enabled");
    }

    const result = verifySync({
      token: dto.code,
      secret: user.twoFactorSecret,
    });

    if (!result.valid) {
      this.logger.warn(
        `TWO_FACTOR_FAILED userId=${userId} reason=invalid_setup_code`,
      );

      this.auditService.logSafe({
        userId,
        event: AuditEvents.TWO_FACTOR_FAILED,
        module: AuditModules.AUTH,
        resourceType: "internal_users",
        resourceId: userId,
        metadata: { reason: "invalid_setup_code" },
      });

      throw new UnauthorizedException("Invalid 2FA code");
    }

    const backupCodes = await this.generateBackupCodes(userId);

    await this.prisma.internalUser.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorEnabledAt: new Date(),
      },
    });

    this.logger.log(`TWO_FACTOR_ENABLED userId=${userId}`);

    this.auditService.logSafe({
      userId,
      event: AuditEvents.TWO_FACTOR_ENABLED,
      module: AuditModules.AUTH,
      resourceType: "internal_users",
      resourceId: userId,
    });

    return { backupCodes };
  }

  async disable(
    userId: string,
    dto: DisableTwoFactorDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.internalUser.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException("2FA is not enabled");
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid password");
    }

    const result = verifySync({
      token: dto.code,
      secret: user.twoFactorSecret!,
    });

    if (!result.valid) {
      this.logger.warn(
        `TWO_FACTOR_FAILED userId=${userId} reason=invalid_disable_code`,
      );

      this.auditService.logSafe({
        userId,
        event: AuditEvents.TWO_FACTOR_FAILED,
        module: AuditModules.AUTH,
        resourceType: "internal_users",
        resourceId: userId,
        metadata: { reason: "invalid_disable_code" },
      });

      throw new UnauthorizedException("Invalid 2FA code");
    }

    await this.prisma.internalUser.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
      },
    });

    await this.prisma.backupCode.deleteMany({ where: { userId } });

    this.logger.log(`TWO_FACTOR_DISABLED userId=${userId}`);

    this.auditService.logSafe({
      userId,
      event: AuditEvents.TWO_FACTOR_DISABLED,
      module: AuditModules.AUTH,
      resourceType: "internal_users",
      resourceId: userId,
    });

    return { message: "2FA has been disabled" };
  }

  async verifyLogin(dto: VerifyTwoFactorLoginDto): Promise<LoginResponseDto> {
    let payload: { sub: string; twoFactorPending: boolean };
    try {
      payload = this.jwtTokenService.verifyAccessToken(
        dto.pendingToken,
      ) as unknown as {
        sub: string;
        twoFactorPending: boolean;
      };
    } catch {
      throw new UnauthorizedException("Invalid or expired pending token");
    }

    if (!payload.twoFactorPending) {
      throw new BadRequestException("Token is not a 2FA pending token");
    }

    const user = await this.prisma.internalUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException("2FA not enabled for this account");
    }

    const isBackupCode = await this.tryBackupCode(user.id, dto.code);

    if (!isBackupCode) {
      const result = verifySync({
        token: dto.code,
        secret: user.twoFactorSecret,
      });

      if (!result.valid) {
        this.logger.warn(
          `TWO_FACTOR_FAILED userId=${user.id} reason=invalid_login_code`,
        );

        this.auditService.logSafe({
          userId: user.id,
          event: AuditEvents.TWO_FACTOR_FAILED,
          module: AuditModules.AUTH,
          resourceType: "internal_users",
          resourceId: user.id,
          metadata: { reason: "invalid_login_code" },
        });

        throw new UnauthorizedException("Invalid 2FA code");
      }
    }

    this.logger.log(
      `TWO_FACTOR_SUCCESS userId=${user.id}${isBackupCode ? " method=backup_code" : ""}`,
    );

    this.auditService.logSafe({
      userId: user.id,
      event: AuditEvents.TWO_FACTOR_SUCCESS,
      module: AuditModules.AUTH,
      resourceType: "internal_users",
      resourceId: user.id,
      metadata: { method: isBackupCode ? "backup_code" : "totp" },
    });

    const accessToken = this.jwtTokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: "",
        loginAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const refreshToken = this.jwtTokenService.generateRefreshToken({
      sub: user.id,
      sessionId: session.id,
    });

    const refreshTokenHash = this.cryptoService.hashToken(refreshToken);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];

    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      const rawCode = crypto.randomBytes(BACKUP_CODE_BYTES).toString("hex");
      const codeHash = this.cryptoService.hashToken(rawCode);

      await this.prisma.backupCode.create({
        data: { userId, codeHash },
      });

      codes.push(rawCode);
    }

    return codes;
  }

  private async tryBackupCode(userId: string, code: string): Promise<boolean> {
    const codeHash = this.cryptoService.hashToken(code);

    const backupCode = await this.prisma.backupCode.findFirst({
      where: { userId, codeHash, usedAt: null },
    });

    if (!backupCode) {
      return false;
    }

    await this.prisma.backupCode.update({
      where: { id: backupCode.id },
      data: { usedAt: new Date() },
    });

    this.logger.log(`BACKUP_CODE_USED userId=${userId}`);

    this.auditService.logSafe({
      userId,
      event: AuditEvents.TWO_FACTOR_BACKUP_CODE_USED,
      module: AuditModules.AUTH,
      resourceType: "internal_users",
      resourceId: userId,
    });

    return true;
  }
}
