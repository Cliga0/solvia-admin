import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SecurityRedisService } from "../security-redis.service";
import { EngineExecutionService } from "../engine/engine-execution.service";
import { EngineType } from "@prisma/client";
import { SecurityDashboardDto, EngineMetricsDto } from "../dto";

@Injectable()
export class SecurityDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: SecurityRedisService,
    private readonly executionService: EngineExecutionService,
  ) {}

  async getDashboard(): Promise<SecurityDashboardDto> {
    const cached = await this.redisService.getCachedDashboard();
    if (cached) {
      return JSON.parse(cached) as SecurityDashboardDto;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      openAlerts,
      criticalAlerts,
      activeIncidents,
      highRiskUsers,
      failedLoginsToday,
      securityEventsToday,
      recentAlerts,
      lastDetectionRun,
      lastRiskCalculationRun,
      alertsCreatedToday,
      detectionEngineStatus,
      riskEngineStatus,
    ] = await Promise.all([
      this.prisma.securityAlert.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.securityAlert.count({
        where: { severity: "CRITICAL", status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.securityIncident.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.userRiskProfile.count({
        where: { riskLevel: { in: ["HIGH", "CRITICAL"] } },
      }),
      this.prisma.auditLog.count({
        where: {
          event: "AUTH_LOGIN_FAILED",
          createdAt: { gte: todayStart },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          event: { in: ["AUTH_LOGIN_FAILED", "TWO_FACTOR_FAILED", "PERMISSION_DENIED", "SECURITY_ALERT_CREATED"] },
          createdAt: { gte: todayStart },
        },
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
    };

    await this.redisService.cacheDashboard(JSON.stringify(dashboard));

    return dashboard;
  }
}
