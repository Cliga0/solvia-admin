import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { DashboardRedisService } from "./dashboard-redis.service";
import { PlatformMetricsService } from "./metrics/platform-metrics.service";
import { SecurityMetricsService } from "./metrics/security-metrics.service";
import { UsersMetricsService } from "./metrics/users-metrics.service";
import { AuditMetricsService } from "./metrics/audit-metrics.service";
import { SystemMetricsService } from "./metrics/system-metrics.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardRedisService,
    PlatformMetricsService,
    SecurityMetricsService,
    UsersMetricsService,
    AuditMetricsService,
    SystemMetricsService,
  ],
  exports: [DashboardService],
})
export class DashboardModule {}
