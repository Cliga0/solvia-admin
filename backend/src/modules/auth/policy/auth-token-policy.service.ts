import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as ms from "ms";

@Injectable()
export class AuthTokenPolicyService {
  constructor(private readonly config: ConfigService) {}

  private parseDurationSeconds(key: string, fallback: string): number {
    const value = this.config.get<string>(key, fallback);
    return Math.floor(ms(value as ms.StringValue) / 1000);
  }
  // =========================
  // ACCESS TOKEN
  // =========================
  get accessTokenTtlSeconds(): number {
    return this.parseDurationSeconds(
      "app.auth.jwt.accessTokenExpiresIn",
      "15m",
    );
  }

  // =========================
  // REFRESH TOKEN (JWT)
  // =========================
  get refreshTokenTtlSeconds(): number {
    return this.parseDurationSeconds(
      "app.auth.jwt.refreshTokenExpiresIn",
      "30d",
    );
  }
}
