import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class AlertMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlertsBySeverity(): Promise<Record<string, number>> {
    const groups = await this.prisma.securityAlert.groupBy({
      by: ["severity"],
      _count: { severity: true },
    });

    const result: Record<string, number> = {};
    for (const g of groups) {
      result[g.severity] = g._count.severity;
    }
    return result;
  }

  async getAlertsByType(): Promise<Record<string, number>> {
    const groups = await this.prisma.securityAlert.groupBy({
      by: ["type"],
      _count: { type: true },
    });

    const result: Record<string, number> = {};
    for (const g of groups) {
      result[g.type] = g._count.type;
    }
    return result;
  }

  async getAlertsLast24Hours(): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.prisma.securityAlert.count({
      where: { createdAt: { gte: since } },
    });
  }

  async getAlertsLast7Days(): Promise<number> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.prisma.securityAlert.count({
      where: { createdAt: { gte: since } },
    });
  }
}
