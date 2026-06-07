import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRedisService } from "./auth-redis.service";
import { AuthCryptoService } from "./auth-crypto.service";
import { AuthSessionPolicyService } from "./policy/auth-session-policy.service";
import { PasswordResetService } from "./password-reset.service";
import { TwoFactorService } from "./two-factor.service";
import { EmailService } from "./email.service";
import { JwtAuthModule } from "./jwt/jwt.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [JwtAuthModule, AuditModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRedisService,
    AuthCryptoService,
    AuthSessionPolicyService,
    PasswordResetService,
    TwoFactorService,
    EmailService,
  ],
  exports: [AuthRedisService],
})
export class AuthModule {}
