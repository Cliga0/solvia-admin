import { Module } from "@nestjs/common";
import { SecurityOpsController } from "./security-ops.controller";
import { AlertsService } from "./alerts/alerts.service";
import { AlertEngineService } from "./alerts/alert-engine.service";
import { IncidentsService } from "./incidents/incidents.service";
import { RiskScoringService } from "./risk/risk-scoring.service";
import { SecurityTimelineService } from "./timeline/security-timeline.service";
import { SecurityDashboardService } from "./monitoring/security-dashboard.service";
import { SecurityMonitoringService } from "./monitoring/security-monitoring.service";
import { SecurityRedisService } from "./security-redis.service";
import { EngineExecutionService } from "./engine/engine-execution.service";
import { AlertDetectionJob } from "./jobs/alert-detection.job";
import { RiskRecalculationJob } from "./jobs/risk-recalculation.job";
import { SecurityRulesService } from "./rules/security-rules.service";
import {
  AlertMetricsService,
  IncidentMetricsService,
  RiskMetricsService,
  ActivityMetricsService,
} from "./metrics";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [SecurityOpsController],
  providers: [
    SecurityRedisService,
    AlertsService,
    AlertEngineService,
    IncidentsService,
    RiskScoringService,
    SecurityTimelineService,
    SecurityDashboardService,
    SecurityMonitoringService,
    EngineExecutionService,
    AlertDetectionJob,
    RiskRecalculationJob,
    SecurityRulesService,
    AlertMetricsService,
    IncidentMetricsService,
    RiskMetricsService,
    ActivityMetricsService,
  ],
  exports: [AlertEngineService, RiskScoringService, EngineExecutionService, SecurityRulesService],
})
export class SecurityOpsModule {}
