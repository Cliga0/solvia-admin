import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

const DASHBOARD_CACHE_KEY = "dashboard:summary";
const DASHBOARD_CACHE_TTL_SECONDS = 60;

@Injectable()
export class DashboardRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DashboardRedisService.name);
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

  async getCachedDashboard(): Promise<string | null> {
    return this.execute("getCachedDashboard", null, async (redis) => {
      return redis.get(DASHBOARD_CACHE_KEY);
    });
  }

  async cacheDashboard(data: string): Promise<void> {
    await this.execute("cacheDashboard", undefined, async (redis) => {
      await redis.set(DASHBOARD_CACHE_KEY, data, "EX", DASHBOARD_CACHE_TTL_SECONDS);
    });
  }

  async invalidateDashboard(): Promise<void> {
    await this.execute("invalidateDashboard", undefined, async (redis) => {
      await redis.del(DASHBOARD_CACHE_KEY);
    });
  }
}
