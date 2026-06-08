import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import {
  AccessTokenPayload,
  PendingTokenPayload,
  RefreshTokenPayload,
  JwtUserPayload,
} from "./jwt.types";
import { AuthTokenPolicyService } from "../policy/auth-token-policy.service";

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly tokenPolicy: AuthTokenPolicyService,
  ) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.tokenPolicy.accessTokenTtlSeconds,
    });
  }

  generatePendingToken(payload: PendingTokenPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: 300,
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.tokenPolicy.refreshTokenTtlSeconds,
    });
  }

  verifyAccessToken(token: string): JwtUserPayload {
    return this.jwtService.verify<JwtUserPayload>(token);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwtService.verify<RefreshTokenPayload>(token);
  }
}
