import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS_KEYS_SETTINGS, SETTINGS_CACHE_TTL_SECONDS } from "@/config";

@Injectable()
export class SettingsRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SettingsRedisService.name);
  private client!: Redis;
  private degradedModeLogged = false;

  constructor(private readonly configService: ConfigService) {}

  private get available(): boolean {
    return this.client?.status === "ready";
  }

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
    if (!this.client) return;
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }

  private async execute<T>(
    operation: string,
    fallback: T,
    callback: (redis: Redis) => Promise<T>,
  ): Promise<T> {
    if (!this.available) return fallback;
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

  async cacheAllSettings(data: string): Promise<void> {
    await this.execute("cacheAllSettings", undefined, async (redis) => {
      await redis.set(
        REDIS_KEYS_SETTINGS.ALL,
        data,
        "EX",
        SETTINGS_CACHE_TTL_SECONDS,
      );
    });
  }

  async getCachedAllSettings(): Promise<string | null> {
    return this.execute("getCachedAllSettings", null, async (redis) => {
      return redis.get(REDIS_KEYS_SETTINGS.ALL);
    });
  }

  async cacheCategorySettings(
    category: string,
    data: string,
  ): Promise<void> {
    await this.execute("cacheCategorySettings", undefined, async (redis) => {
      await redis.set(
        REDIS_KEYS_SETTINGS.CATEGORY + category,
        data,
        "EX",
        SETTINGS_CACHE_TTL_SECONDS,
      );
    });
  }

  async getCachedCategorySettings(category: string): Promise<string | null> {
    return this.execute("getCachedCategorySettings", null, async (redis) => {
      return redis.get(REDIS_KEYS_SETTINGS.CATEGORY + category);
    });
  }

  async invalidateAll(): Promise<void> {
    await this.execute("invalidateAll", undefined, async (redis) => {
      const keys = await redis.keys("settings:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    });
  }

  async invalidateCategory(category: string): Promise<void> {
    await this.execute("invalidateCategory", undefined, async (redis) => {
      await redis.del(REDIS_KEYS_SETTINGS.CATEGORY + category);
    });
  }
}
