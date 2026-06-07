import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS_KEYS } from "@/config";

const PERMISSION_CACHE_TTL_SECONDS = 300;

@Injectable()
export class RbacRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RbacRedisService.name);

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

  async getCachedPermissions(userId: string): Promise<string[] | null> {
    return this.execute("getCachedPermissions", null, async (redis) => {
      const data = await redis.get(REDIS_KEYS.AUTH_USER_PERMISSIONS + userId);
      if (!data) return null;
      return JSON.parse(data) as string[];
    });
  }

  async setCachedPermissions(userId: string, codes: string[]): Promise<void> {
    await this.execute("setCachedPermissions", undefined, async (redis) => {
      await redis.set(
        REDIS_KEYS.AUTH_USER_PERMISSIONS + userId,
        JSON.stringify(codes),
        "EX",
        PERMISSION_CACHE_TTL_SECONDS,
      );
    });
  }

  async invalidateCachedPermissions(userId: string): Promise<void> {
    await this.execute(
      "invalidateCachedPermissions",
      undefined,
      async (redis) => {
        await redis.del(REDIS_KEYS.AUTH_USER_PERMISSIONS + userId);
      },
    );
  }
}
