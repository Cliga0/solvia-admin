import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { DashboardRedisService } from "./dashboard-redis.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRedisService],
  exports: [DashboardService],
})
export class DashboardModule {}
