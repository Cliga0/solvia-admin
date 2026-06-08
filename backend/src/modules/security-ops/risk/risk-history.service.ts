import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { RiskLevel, Prisma } from "@prisma/client";
import { RiskHistoryResponseDto, RiskTrendDto } from "../dto";

@Injectable()
export class RiskHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordRiskCalculation(
    userId: string,
    riskScore: number,
    riskLevel: RiskLevel,
    breakdown: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.userRiskHistory.create({
      data: { userId, riskScore, riskLevel, breakdown: breakdown as Prisma.InputJsonValue },
    });
  }

  async getUserRiskHistory(userId: string, limit = 30): Promise<RiskHistoryResponseDto> {
    const history = await this.prisma.userRiskHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const trend = this.buildTrend(history as Array<{ riskScore: number; createdAt: Date }>);

    return {
      history: history.map((h) => ({
        id: h.id,
        userId: h.userId,
        riskScore: h.riskScore,
        riskLevel: h.riskLevel,
        breakdown: h.breakdown as Record<string, unknown> | null,
        createdAt: h.createdAt,
      })),
      trend,
      total: history.length,
    };
  }

  async getGlobalRiskTrend(days = 7): Promise<RiskTrendDto[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await this.prisma.userRiskHistory.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { riskScore: true, createdAt: true },
    });

    return this.buildTrend(history);
  }

  private buildTrend(
    entries: Array<{ riskScore: number; createdAt: Date }>,
  ): RiskTrendDto[] {
    const byDay = new Map<string, number[]>();

    for (const entry of entries) {
      const day = entry.createdAt.toISOString().slice(0, 10);
      const scores = byDay.get(day) ?? [];
      scores.push(entry.riskScore);
      byDay.set(day, scores);
    }

    return Array.from(byDay.entries()).map(([date, scores]) => ({
      date,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
    }));
  }
}
