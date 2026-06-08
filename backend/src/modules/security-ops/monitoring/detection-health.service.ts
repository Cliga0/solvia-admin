import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { EngineExecutionService } from "../engine/engine-execution.service";
import { EngineType } from "@prisma/client";
import { DetectionHealthMetricsDto, RulePerformanceDto } from "../dto";

@Injectable()
export class DetectionHealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly executionService: EngineExecutionService,
  ) {}

  async getDetectionHealth(): Promise<DetectionHealthMetricsDto> {
    const [
      rulesEnabled,
      rulesDisabled,
      lastExecution,
      recentExecutions,
      alertsToday,
      incidentsToday,
    ] = await Promise.all([
      this.prisma.securityRule.count({ where: { enabled: true } }),
      this.prisma.securityRule.count({ where: { enabled: false } }),
      this.executionService.getLastSuccessfulRun(EngineType.ALERT_DETECTION),
      this.prisma.securityEngineExecution.findMany({
        where: { engine: EngineType.ALERT_DETECTION },
        orderBy: { startedAt: "desc" },
        take: 10,
        select: { durationMs: true, alertsCreated: true, status: true },
      }),
      this.executionService.getAlertsCreatedToday(),
      this.getIncidentsCreatedToday(),
    ]);

    const completedExecutions = recentExecutions.filter(
      (e) => e.status === "COMPLETED" && e.durationMs !== null,
    );

    const averageExecutionTimeMs =
      completedExecutions.length > 0
        ? Math.round(
            completedExecutions.reduce((sum, e) => sum + (e.durationMs ?? 0), 0) /
              completedExecutions.length,
          )
        : 0;

    const topTriggeredRules = await this.getTopTriggeredRules();

    const engineStatus = await this.executionService.getEngineStatus(EngineType.ALERT_DETECTION);
    const engineHealthStatus = engineStatus.isRunning
      ? "RUNNING"
      : (engineStatus.lastStatus ?? "IDLE");

    return {
      rulesExecuted: rulesEnabled,
      rulesEnabled,
      rulesDisabled,
      alertsGenerated: alertsToday,
      incidentsGenerated: incidentsToday,
      averageExecutionTimeMs,
      lastExecutionTime: lastExecution,
      engineHealthStatus,
      topTriggeredRules,
    };
  }

  private async getIncidentsCreatedToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.securityIncident.count({
      where: { createdAt: { gte: startOfDay } },
    });
  }

  private async getTopTriggeredRules(): Promise<RulePerformanceDto[]> {
    const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rules = await this.prisma.securityRule.findMany({
      select: { code: true, name: true, alertType: true, enabled: true },
    });

    const alertsByType = await this.prisma.securityAlert.groupBy({
      by: ["type"],
      where: { createdAt: { gte: startOfWeek } },
      _count: { id: true },
    });

    const countByType = new Map(alertsByType.map((a) => [a.type, a._count.id]));

    return rules
      .map((r) => ({
        ruleCode: r.code,
        ruleName: r.name,
        alertsGenerated: countByType.get(r.alertType) ?? 0,
        enabled: r.enabled,
      }))
      .sort((a, b) => b.alertsGenerated - a.alertsGenerated)
      .slice(0, 5);
  }
}
