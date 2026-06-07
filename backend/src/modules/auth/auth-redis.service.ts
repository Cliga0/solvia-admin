import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

import { REDIS_KEYS } from "@/config";
@Injectable()
export class AuthRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuthRedisService.name);

  private client!: Redis;
  private degradedModeLogged = false;

  constructor(private readonly configService: ConfigService) {}

  // ------------------------
  // CONFIG ACCESSORS
  // ------------------------

  private get loginWindowSeconds(): number {
    return this.configService.getOrThrow<number>(
      "app.auth.session.loginWindowSeconds",
    );
  }

  private get maxLoginAttempts(): number {
    return this.configService.getOrThrow<number>(
      "app.auth.session.maxLoginAttempts",
    );
  }

  private get blacklistTtlSeconds(): number {
    return this.configService.getOrThrow<number>(
      "app.auth.session.blacklistTtlSeconds",
    );
  }

  private get sessionCacheTtlSeconds(): number {
    return this.configService.getOrThrow<number>(
      "app.auth.session.sessionCacheTtlSeconds",
    );
  }

  private get available(): boolean {
    return this.client?.status === "ready";
  }

  // ------------------------
  // LIFECYCLE
  // ------------------------

  async onModuleInit(): Promise<void> {
    this.client = new Redis({
      host: this.configService.getOrThrow<string>("app.redis.host"),
      port: this.configService.getOrThrow<number>("app.redis.port"),
      password:
        this.configService.get<string>("app.redis.password") || undefined,

      lazyConnect: true,
      connectTimeout: 5000,

      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,

      retryStrategy: () => null,
    });

    this.client.on("ready", () => {
      this.degradedModeLogged = true;
      this.logger.log("Redis connection established");
    });

    this.client.on("end", () => {
      this.logger.warn("Redis disconnected (degraded mode)");
    });

    this.client.on("error", (err) => {
      if (!this.degradedModeLogged) {
        this.degradedModeLogged = true;

        this.logger.warn(
          `Redis unavailable. Running in degraded mode. ${err.message}`,
        );
      }
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.warn(
        `Redis unavailable. Running in degraded mode. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }

  // =========================================================
  // INTERNAL EXECUTOR
  // =========================================================

  private async execute<T>(
    operation: string,
    fallback: T,
    callback: (redis: Redis) => Promise<T>,
  ): Promise<T> {
    if (!this.available) {
      return fallback;
    }

    try {
      return await callback(this.client);
    } catch (error) {
      this.logger.warn(
        `[${operation}] Redis unavailable: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return fallback;
    }
  }

  // ------------------------
  // LOGIN ATTEMPTS
  // ------------------------

  async recordFailedLogin(key: string): Promise<number> {
    return this.execute("recordFailedLogin", 0, async (redis) => {
      const redisKey = REDIS_KEYS.AUTH_LOGIN_ATTEMPTS + key;

      const attempts = await redis.incr(redisKey);

      if (attempts === 1) {
        await redis.expire(redisKey, this.loginWindowSeconds);
      }

      return attempts;
    });
  }

  async getLoginAttempts(key: string): Promise<number> {
    return this.execute("getLoginAttempts", 0, async (redis) => {
      const value = await redis.get(REDIS_KEYS.AUTH_LOGIN_ATTEMPTS + key);

      return value ? parseInt(value, 10) : 0;
    });
  }

  async isLoginBlocked(key: string): Promise<boolean> {
    const attempts = await this.getLoginAttempts(key);
    return attempts >= this.maxLoginAttempts;
  }

  async clearLoginAttempts(key: string): Promise<void> {
    await this.execute("clearLoginAttempts", undefined, async (redis) => {
      await redis.del(REDIS_KEYS.AUTH_LOGIN_ATTEMPTS + key);
    });
  }

  // ------------------------
  // TOKEN BLACKLIST
  // ------------------------

  async blacklistToken(tokenHash: string): Promise<void> {
    await this.execute("blacklistToken", undefined, async (redis) => {
      await redis.set(
        REDIS_KEYS.AUTH_BLACKLIST + tokenHash,
        "1",
        "EX",
        this.blacklistTtlSeconds,
      );
    });
  }

  async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
    return this.execute("isTokenBlacklisted", false, async (redis) => {
      const exists = await redis.exists(REDIS_KEYS.AUTH_BLACKLIST + tokenHash);

      return exists === 1;
    });
  }

  // ------------------------
  // SESSION CACHE
  // ------------------------

  async cacheSession(
    sessionId: string,
    data: Record<string, string>,
  ): Promise<void> {
    await this.execute("cacheSession", undefined, async (redis) => {
      const key = REDIS_KEYS.AUTH_SESSION_CACHE + sessionId;

      const pipeline = redis.pipeline();

      pipeline.hset(key, data);
      pipeline.expire(key, this.sessionCacheTtlSeconds);

      await pipeline.exec();
    });
  }

  async getCachedSession(
    sessionId: string,
  ): Promise<Record<string, string> | null> {
    return this.execute("getCachedSession", null, async (redis) => {
      const data = await redis.hgetall(
        REDIS_KEYS.AUTH_SESSION_CACHE + sessionId,
      );

      return Object.keys(data).length ? data : null;
    });
  }

  async invalidateSessionCache(sessionId: string): Promise<void> {
    await this.execute("invalidateSessionCache", undefined, async (redis) => {
      await redis.del(REDIS_KEYS.AUTH_SESSION_CACHE + sessionId);
    });
  }

  // ------------------------
  // USER SESSIONS
  // ------------------------

  async addUserSession(userId: string, sessionId: string): Promise<void> {
    await this.execute("addUserSession", undefined, async (redis) => {
      await redis.sadd(REDIS_KEYS.AUTH_USER_SESSIONS + userId, sessionId);
    });
  }

  async removeUserSession(userId: string, sessionId: string): Promise<void> {
    await this.execute("removeUserSession", undefined, async (redis) => {
      await redis.srem(REDIS_KEYS.AUTH_USER_SESSIONS + userId, sessionId);
    });
  }

  async getUserSessionIds(userId: string): Promise<string[]> {
    return this.execute("getUserSessionIds", [], async (redis) => {
      return redis.smembers(REDIS_KEYS.AUTH_USER_SESSIONS + userId);
    });
  }

  // ------------------------
  // PASSWORD RESET RATE LIMIT
  // ------------------------

  async recordResetRequest(
    key: string,
    windowSeconds: number,
    maxRequests: number,
  ): Promise<boolean> {
    return this.execute("recordResetRequest", true, async (redis) => {
      const redisKey = REDIS_KEYS.AUTH_RESET_REQUESTS + key;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      return count <= maxRequests;
    });
  }
}
