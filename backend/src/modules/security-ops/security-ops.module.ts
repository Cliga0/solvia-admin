import { Module } from "@nestjs/common";
import { SecurityOpsController } from "./security-ops.controller";
import { AlertsService } from "./alerts/alerts.service";
import { AlertEngineService } from "./alerts/alert-engine.service";
import { AlertDeduplicationService } from "./alerts/alert-deduplication.service";
import { AlertContextService } from "./alerts/alert-context.service";
import { SecurityCorrelationService } from "./alerts/alert-correlation.service";
import { IncidentsService } from "./incidents/incidents.service";
import { IncidentAutomationService } from "./incidents/incident-automation.service";
import { RiskScoringService } from "./risk/risk-scoring.service";
import { RiskHistoryService } from "./risk/risk-history.service";
import { SecurityTimelineService } from "./timeline/security-timeline.service";
import { SecurityGlobalTimelineService } from "./timeline/security-global-timeline.service";
import { SecurityDashboardService } from "./monitoring/security-dashboard.service";
import { SecurityMonitoringService } from "./monitoring/security-monitoring.service";
import { DetectionHealthService } from "./monitoring/detection-health.service";
import { SecurityRedisService } from "./security-redis.service";
import { EngineExecutionService } from "./engine/engine-execution.service";
import { AlertDetectionJob } from "./jobs/alert-detection.job";
import { RiskRecalculationJob } from "./jobs/risk-recalculation.job";
import { SecurityRulesService } from "./rules/security-rules.service";
import { SecurityRuleHistoryService } from "./rules/security-rule-history.service";
import {
  AlertMetricsService,
  IncidentMetricsService,
  RiskMetricsService,
  ActivityMetricsService,
} from "./metrics";
import { SecurityKpiService } from "./metrics/security-kpi.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [SecurityOpsController],
  providers: [
    SecurityRedisService,
    AlertsService,
    AlertEngineService,
    AlertDeduplicationService,
    AlertContextService,
    SecurityCorrelationService,
    IncidentsService,
    IncidentAutomationService,
    RiskScoringService,
    RiskHistoryService,
    SecurityTimelineService,
    SecurityGlobalTimelineService,
    SecurityDashboardService,
    SecurityMonitoringService,
    DetectionHealthService,
    EngineExecutionService,
    AlertDetectionJob,
    RiskRecalculationJob,
    SecurityRulesService,
    SecurityRuleHistoryService,
    AlertMetricsService,
    IncidentMetricsService,
    RiskMetricsService,
    ActivityMetricsService,
    SecurityKpiService,
  ],
  exports: [
    AlertEngineService,
    RiskScoringService,
    EngineExecutionService,
    SecurityRulesService,
    RiskHistoryService,
    SecurityRuleHistoryService,
    SecurityGlobalTimelineService,
    SecurityCorrelationService,
    DetectionHealthService,
    SecurityKpiService,
  ],
})
export class SecurityOpsModule {}
