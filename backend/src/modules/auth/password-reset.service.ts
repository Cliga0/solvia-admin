import {
  Injectable,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import * as argon2 from "argon2";
import * as crypto from "crypto";
import { PrismaService } from "@/prisma/prisma.service";
import { AuthCryptoService } from "./auth-crypto.service";
import { AuthRedisService } from "./auth-redis.service";
import { EmailService } from "./email.service";
import { AuditService } from "../audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const RESET_REQUEST_WINDOW_SECONDS = 900;
const MAX_RESET_REQUESTS_PER_WINDOW = 3;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: AuthCryptoService,
    private readonly redisService: AuthRedisService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async forgotPassword(
    dto: ForgotPasswordDto,
    ip?: string,
  ): Promise<{ message: string }> {
    const rateLimitKey = `${ip ?? "unknown"}:${dto.email}`;
    const allowed = await this.redisService.recordResetRequest(
      rateLimitKey,
      RESET_REQUEST_WINDOW_SECONDS,
      MAX_RESET_REQUESTS_PER_WINDOW,
    );

    if (!allowed) {
      this.logger.warn(`RATE_LIMIT_TRIGGERED action=forgot_password ip=${ip}`);
      throw new HttpException(
        "Too many reset requests. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.internalUser.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      this.logger.log("PASSWORD_RESET_REQUESTED user=not_found");

      this.auditService.logSafe({
        event: AuditEvents.PASSWORD_RESET_REQUESTED,
        module: AuditModules.AUTH,
        ip,
        metadata: { email: dto.email, userFound: false },
      });

      return {
        message:
          "If an account with this email exists, a reset link has been sent.",
      };
    }

    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const tokenHash = this.cryptoService.hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_EXPIRY_MINUTES);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, rawToken);

    this.logger.log(`PASSWORD_RESET_REQUESTED userId=${user.id}`);

    this.auditService.logSafe({
      userId: user.id,
      event: AuditEvents.PASSWORD_RESET_REQUESTED,
      module: AuditModules.AUTH,
      ip,
      resourceType: "internal_users",
      resourceId: user.id,
      metadata: { email: user.email, userFound: true },
    });

    return {
      message:
        "If an account with this email exists, a reset link has been sent.",
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.cryptoService.hashToken(dto.token);

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt) {
      this.logger.warn("PASSWORD_RESET_FAILED reason=invalid_token");

      this.auditService.logSafe({
        userId: resetToken?.userId,
        event: AuditEvents.PASSWORD_RESET_FAILED,
        module: AuditModules.AUTH,
        metadata: { reason: "invalid_or_used_token" },
      });

      throw new UnauthorizedException("Invalid or expired reset token");
    }

    if (resetToken.expiresAt < new Date()) {
      this.logger.warn("PASSWORD_RESET_FAILED reason=token_expired");

      this.auditService.logSafe({
        userId: resetToken.userId,
        event: AuditEvents.PASSWORD_RESET_FAILED,
        module: AuditModules.AUTH,
        metadata: { reason: "token_expired" },
      });

      throw new UnauthorizedException("Invalid or expired reset token");
    }

    const newPasswordHash = await argon2.hash(dto.password);

    await this.prisma.internalUser.update({
      where: { id: resetToken.userId },
      data: { passwordHash: newPasswordHash },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await this.revokeAllUserSessions(resetToken.userId);

    this.logger.log(`PASSWORD_RESET_SUCCESS userId=${resetToken.userId}`);

    this.auditService.logSafe({
      userId: resetToken.userId,
      event: AuditEvents.PASSWORD_RESET_COMPLETED,
      module: AuditModules.AUTH,
      resourceType: "internal_users",
      resourceId: resetToken.userId,
    });

    return { message: "Password has been reset successfully." };
  }

  private async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, isRevoked: false },
    });

    for (const session of sessions) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { isRevoked: true, logoutAt: new Date() },
      });

      if (session.refreshTokenHash) {
        await this.redisService.blacklistToken(session.refreshTokenHash);
      }

      await this.redisService.invalidateSessionCache(session.id);
      await this.redisService.removeUserSession(userId, session.id);
    }
  }
}
