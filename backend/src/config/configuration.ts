import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  // =========================
  // SERVER
  // =========================
  port: parseInt(process.env.PORT ?? "3001", 10),
  env: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  // =========================
  // THROTTLE (GLOBAL DEFAULT)
  // =========================
  throttle: {
    ttl: parseInt(process.env.THROTTLE_RATE_LIMIT_TTL ?? "60000", 10),
    limit: parseInt(process.env.THROTTLE_RATE_LIMIT_MAX ?? "100", 10),
  },

  // =========================
  // AUTH (SECURITY POLICY)
  // =========================
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      issuer: process.env.JWT_ISSUER ?? "solvia-admin",

      accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION ?? "15m",

      refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION ?? "30d",
    },

    session: {
      refreshTokenTtlDays: parseInt(
        process.env.AUTH_REFRESH_TOKEN_TTL_DAYS ?? "30",
        10,
      ),

      loginWindowSeconds: parseInt(
        process.env.AUTH_LOGIN_WINDOW_SECONDS ?? "900",
        10,
      ),

      maxLoginAttempts: parseInt(
        process.env.AUTH_MAX_LOGIN_ATTEMPTS ?? "10",
        10,
      ),

      blacklistTtlSeconds: parseInt(
        process.env.AUTH_TOKEN_BLACKLIST_TTL_SECONDS ?? "2678400",
        10,
      ),

      cacheTtlSeconds: parseInt(
        process.env.AUTH_SESSION_CACHE_TTL_SECONDS ?? "300",
        10,
      ),
    },
  },

  // =========================
  // REDIS (INFRA)
  // =========================
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
    password: process.env.REDIS_PASSWORD,
  },
}));
