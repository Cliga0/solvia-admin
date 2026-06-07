import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthSessionPolicyService {
  constructor(private readonly config: ConfigService) {}

  // =========================
  // LOGIN SECURITY
  // =========================
  get loginWindowSeconds(): number {
    return this.config.get<number>("app.auth.session.loginWindowSeconds", 900);
  }

  get maxLoginAttempts(): number {
    return this.config.get<number>("app.auth.session.maxLoginAttempts", 10);
  }

  // =========================
  // BLACKLIST (Redis TTL)
  // =========================
  get blacklistTtlSeconds(): number {
    return this.config.get<number>(
      "app.auth.session.blacklistTtlSeconds",
      60 * 60 * 24 * 31,
    );
  }

  get sessionCacheTtlSeconds(): number {
    return this.config.get<number>("app.auth.session.cacheTtlSeconds", 300);
  }

  // =========================
  // SESSION LIFETIME (DB)
  // =========================
  get sessionTtlDays(): number {
    return this.config.get<number>("app.auth.session.sessionTtlDays", 30);
  }

  getSessionExpiryDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + this.sessionTtlDays);
    return date;
  }
}
