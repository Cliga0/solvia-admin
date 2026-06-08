import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SecurityKpiDto } from "../dto";

@Injectable()
export class SecurityKpiService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(): Promise<SecurityKpiDto> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [
      alertsToday,
      alertsLast7Days,
      alertsPrev7Days,
      criticalAlertsToday,
      openIncidents,
      resolvedIncidentsToday,
      incidentsLast7Days,
      incidentsPrev7Days,
      highRiskUsersCount,
      resolvedAlertsWithTimes,
      resolvedIncidentsWithTimes,
    ] = await Promise.all([
      this.prisma.securityAlert.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.securityAlert.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.securityAlert.count({
        where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      }),
      this.prisma.securityAlert.count({
        where: { severity: "CRITICAL", createdAt: { gte: startOfToday } },
      }),
      this.prisma.securityIncident.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      }),
      this.prisma.securityIncident.count({
        where: { status: "RESOLVED", resolvedAt: { gte: startOfToday } },
      }),
      this.prisma.securityIncident.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.securityIncident.count({
        where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      }),
      this.prisma.userRiskProfile.count({
        where: { riskLevel: { in: ["HIGH", "CRITICAL"] } },
      }),
      this.prisma.securityAlert.findMany({
        where: { resolvedAt: { not: null }, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, resolvedAt: true },
        take: 100,
      }),
      this.prisma.securityIncident.findMany({
        where: { resolvedAt: { not: null }, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, resolvedAt: true },
        take: 100,
      }),
    ]);

    const mttd = this.calcMean(
      resolvedAlertsWithTimes.map((a) =>
        a.resolvedAt ? a.resolvedAt.getTime() - a.createdAt.getTime() : null,
      ),
    );

    const mttr = this.calcMean(
      resolvedIncidentsWithTimes.map((i) =>
        i.resolvedAt ? i.resolvedAt.getTime() - i.createdAt.getTime() : null,
      ),
    );

    const alertGrowthRate = this.growthRate(alertsLast7Days, alertsPrev7Days);
    const incidentGrowthRate = this.growthRate(incidentsLast7Days, incidentsPrev7Days);

    return {
      meanTimeToDetectMs: mttd,
      meanTimeToResolveMs: mttr,
      alertsToday,
      alertsLast7Days,
      criticalAlertsToday,
      openIncidents,
      resolvedIncidentsToday,
      alertGrowthRate,
      incidentGrowthRate,
      riskGrowthRate: alertGrowthRate,
      highRiskUsersCount,
    };
  }

  private calcMean(values: Array<number | null>): number | null {
    const valid = values.filter((v): v is number => v !== null);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  }

  private growthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
