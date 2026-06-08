import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class RiskMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRiskDistribution(): Promise<Record<string, number>> {
    const groups = await this.prisma.userRiskProfile.groupBy({
      by: ["riskLevel"],
      _count: { riskLevel: true },
    });

    const result: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    for (const g of groups) {
      result[g.riskLevel] = g._count.riskLevel;
    }
    return result;
  }
}
