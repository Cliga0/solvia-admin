import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SecurityRedisService } from "../security-redis.service";
import { EngineExecutionService } from "../engine/engine-execution.service";
import { AlertMetricsService } from "../metrics/alert-metrics.service";
import { IncidentMetricsService } from "../metrics/incident-metrics.service";
import { RiskMetricsService } from "../metrics/risk-metrics.service";
import { ActivityMetricsService } from "../metrics/activity-metrics.service";
import { EngineType } from "@prisma/client";
import { SecurityDashboardDto, EngineMetricsDto } from "../dto";

@Injectable()
export class SecurityDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: SecurityRedisService,
    private readonly executionService: EngineExecutionService,
    private readonly alertMetrics: AlertMetricsService,
    private readonly incidentMetrics: IncidentMetricsService,
    private readonly riskMetrics: RiskMetricsService,
    private readonly activityMetrics: ActivityMetricsService,
  ) {}

  async getDashboard(): Promise<SecurityDashboardDto> {
    const cached = await this.redisService.getCachedDashboard();
    if (cached) {
      return JSON.parse(cached) as SecurityDashboardDto;
    }

    const [
      openAlerts,
      criticalAlerts,
      recentAlerts,
      lastDetectionRun,
      lastRiskCalculationRun,
      alertsCreatedToday,
      detectionEngineStatus,
      riskEngineStatus,
      alertsBySeverity,
      alertsByType,
      incidentsByStatus,
      riskDistribution,
      alertsLast24Hours,
      alertsLast7Days,
      failedLoginsToday,
      securityEventsToday,
      activeIncidents,
      highRiskUsers,
    ] = await Promise.all([
      this.prisma.securityAlert.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.securityAlert.count({
        where: { severity: "CRITICAL", status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.securityAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          severity: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
      this.executionService.getLastSuccessfulRun(EngineType.ALERT_DETECTION),
      this.executionService.getLastSuccessfulRun(EngineType.RISK_RECALCULATION),
      this.executionService.getAlertsCreatedToday(),
      this.executionService.getEngineStatus(EngineType.ALERT_DETECTION),
      this.executionService.getEngineStatus(EngineType.RISK_RECALCULATION),
      this.alertMetrics.getAlertsBySeverity(),
      this.alertMetrics.getAlertsByType(),
      this.incidentMetrics.getIncidentsByStatus(),
      this.riskMetrics.getRiskDistribution(),
      this.alertMetrics.getAlertsLast24Hours(),
      this.alertMetrics.getAlertsLast7Days(),
      this.activityMetrics.getFailedLoginsToday(),
      this.activityMetrics.getSecurityEventsToday(),
      this.prisma.securityIncident.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.userRiskProfile.count({
        where: { riskLevel: { in: ["HIGH", "CRITICAL"] } },
      }),
    ]);

    const engineMetrics: EngineMetricsDto = {
      lastDetectionRun,
      lastRiskCalculationRun,
      alertsCreatedToday,
      detectionEngineStatus: detectionEngineStatus.isRunning
        ? "RUNNING"
        : (detectionEngineStatus.lastStatus ?? "IDLE"),
      riskEngineStatus: riskEngineStatus.isRunning
        ? "RUNNING"
        : (riskEngineStatus.lastStatus ?? "IDLE"),
    };

    const dashboard: SecurityDashboardDto = {
      openAlerts,
      criticalAlerts,
      activeIncidents,
      highRiskUsers,
      failedLoginsToday,
      securityEventsToday,
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        status: a.status,
        createdAt: a.createdAt,
      })),
      engineMetrics,
      alertsBySeverity,
      alertsByType,
      incidentsByStatus,
      riskDistribution,
      alertsLast24Hours,
      alertsLast7Days,
    };

    await this.redisService.cacheDashboard(JSON.stringify(dashboard));

    return dashboard;
  }
}
