import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { JwtStrategy } from "./jwt.strategy";
import { JwtTokenService } from "./jwt.service";
import { AuthPolicyModule } from "../policy/auth-policy.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("app.auth.jwt.secret"),
        signOptions: {
          issuer: configService.get<string>("app.auth.issuer", "solvia-admin"),
        },
      }),
    }),

    AuthPolicyModule,
  ],
  providers: [JwtStrategy, JwtTokenService],
  exports: [JwtModule, JwtTokenService],
})
export class JwtAuthModule {}
