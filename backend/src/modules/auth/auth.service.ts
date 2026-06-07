import {
  Injectable,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "@/prisma/prisma.service";
import { JwtTokenService } from "./jwt/jwt.service";
import { AuthRedisService } from "./auth-redis.service";
import { AuthCryptoService } from "./auth-crypto.service";
import { AuthSessionPolicyService } from "./policy/auth-session-policy.service";
import { AuditService } from "../audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  TwoFactorPendingResponseDto,
} from "./dto";
import {
  AccessTokenPayload,
  PendingTokenPayload,
  RefreshTokenPayload,
} from "./jwt/jwt.types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: AuthRedisService,
    private readonly cryptoService: AuthCryptoService,
    private readonly sessionPolicy: AuthSessionPolicyService,
    private readonly auditService: AuditService,
  ) {}

  // =========================
  // LOGIN
  // =========================

  async login(
    dto: LoginDto,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<LoginResponseDto | TwoFactorPendingResponseDto> {
    const bruteKey = `${meta?.ip ?? "unknown"}:${dto.email}`;

    // 1. Anti brute-force
    if (await this.redisService.isLoginBlocked(bruteKey)) {
      throw new HttpException(
        "Too many login attempts. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. User lookup
    const user = await this.prisma.internalUser.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      await this.redisService.recordFailedLogin(bruteKey);

      this.auditService.logSafe({
        event: AuditEvents.AUTH_LOGIN_FAILED,
        module: AuditModules.AUTH,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
        metadata: { email: dto.email, reason: "user_not_found_or_inactive" },
      });

      throw new UnauthorizedException("Invalid credentials");
    }

    // 3. Password check
    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      await this.redisService.recordFailedLogin(bruteKey);

      this.auditService.logSafe({
        userId: user.id,
        event: AuditEvents.AUTH_LOGIN_FAILED,
        module: AuditModules.AUTH,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
        metadata: { email: user.email, reason: "invalid_password" },
      });

      throw new UnauthorizedException("Invalid credentials");
    }

    await this.redisService.clearLoginAttempts(bruteKey);

    // 4. 2FA check
    if (user.twoFactorEnabled) {
      const pendingPayload: PendingTokenPayload = {
        sub: user.id,
        twoFactorPending: true,
      };
      const pendingToken =
        this.jwtTokenService.generatePendingToken(pendingPayload);

      this.logger.log(`LOGIN_PENDING_2FA userId=${user.id}`);

      return { pendingToken, twoFactorRequired: true };
    }

    // =========================
    // 4. ACCESS TOKEN
    // =========================

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = this.jwtTokenService.generateAccessToken(accessPayload);

    // =========================
    // 5. CREATE SESSION
    // =========================

    const expiresAt = this.sessionPolicy.getSessionExpiryDate();

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: "",
        deviceId: this.cryptoService.deriveDeviceId(meta?.userAgent),
        ip: meta?.ip ?? null,
        userAgent: meta?.userAgent ?? null,
        loginAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt,
      },
    });

    // =========================
    // 6. REFRESH TOKEN
    // =========================

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sessionId: session.id,
    };

    const refreshToken =
      this.jwtTokenService.generateRefreshToken(refreshPayload);

    const refreshTokenHash = this.cryptoService.hashToken(refreshToken);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash },
    });

    // =========================
    // 7. CACHE / REDIS
    // =========================

    await this.redisService.addUserSession(user.id, session.id);

    await this.redisService.cacheSession(session.id, {
      userId: user.id,
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    });

    this.auditService.logSafe({
      userId: user.id,
      event: AuditEvents.AUTH_LOGIN_SUCCESS,
      module: AuditModules.AUTH,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      resourceType: "user_sessions",
      resourceId: session.id,
      metadata: { email: user.email, loginMethod: "password" },
    });

    return { accessToken, refreshToken };
  }

  // =========================
  // REFRESH TOKEN
  // =========================

  async refreshToken(dto: RefreshTokenDto): Promise<LoginResponseDto> {
    const tokenHash = this.cryptoService.hashToken(dto.refreshToken);

    if (await this.redisService.isTokenBlacklisted(tokenHash)) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await this.prisma.userSession.findFirst({
      where: { refreshTokenHash: tokenHash, isRevoked: false },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (session.expiresAt < new Date()) {
      await this.revokeSession(session.id, tokenHash);
      throw new UnauthorizedException("Refresh token expired");
    }

    const accessToken = this.jwtTokenService.generateAccessToken({
      sub: session.user.id,
      email: session.user.email,
    });
    const newRefreshToken = this.jwtTokenService.generateRefreshToken({
      sub: session.user.id,
      sessionId: session.id,
    });

    const newHash = this.cryptoService.hashToken(newRefreshToken);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHash,
        lastActiveAt: new Date(),
        expiresAt: this.sessionPolicy.getSessionExpiryDate(),
      },
    });

    await this.redisService.blacklistToken(tokenHash);

    this.auditService.logSafe({
      userId: session.user.id,
      event: AuditEvents.AUTH_TOKEN_REFRESHED,
      module: AuditModules.AUTH,
      ip: session.ip ?? undefined,
      userAgent: session.userAgent ?? undefined,
      resourceType: "user_sessions",
      resourceId: session.id,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // =========================
  // LOGOUT
  // =========================

  async logout(dto: RefreshTokenDto): Promise<{ message: string }> {
    const tokenHash = this.cryptoService.hashToken(dto.refreshToken);

    const session = await this.prisma.userSession.findFirst({
      where: { refreshTokenHash: tokenHash, isRevoked: false },
    });

    if (session) {
      await this.revokeSession(session.id, tokenHash);

      this.auditService.logSafe({
        userId: session.userId,
        event: AuditEvents.AUTH_LOGOUT,
        module: AuditModules.AUTH,
        ip: session.ip ?? undefined,
        userAgent: session.userAgent ?? undefined,
        resourceType: "user_sessions",
        resourceId: session.id,
      });
    }

    return { message: "Logged out successfully" };
  }

  // =========================
  // PRIVATE HELPERS
  // =========================
  private async revokeSession(sessionId: string, tokenHash: string) {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        logoutAt: new Date(),
      },
    });

    await this.redisService.blacklistToken(tokenHash);
    await this.redisService.invalidateSessionCache(sessionId);
  }
}
