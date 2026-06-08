import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { RuleHistoryResponseDto } from "../dto";

@Injectable()
export class SecurityRuleHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordRuleChange(
    ruleId: string,
    previousConfiguration: Record<string, unknown>,
    newConfiguration: Record<string, unknown>,
    changedBy?: string,
  ): Promise<void> {
    await this.prisma.securityRuleHistory.create({
      data: {
        ruleId,
        previousConfiguration: previousConfiguration as Prisma.InputJsonValue,
        newConfiguration: newConfiguration as Prisma.InputJsonValue,
        changedBy: changedBy ?? null,
      },
    });
  }

  async getRuleHistory(ruleId: string, limit = 50): Promise<RuleHistoryResponseDto> {
    const history = await this.prisma.securityRuleHistory.findMany({
      where: { ruleId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      history: history.map((h) => ({
        id: h.id,
        ruleId: h.ruleId,
        previousConfiguration: h.previousConfiguration as Record<string, unknown> | null,
        newConfiguration: h.newConfiguration as Record<string, unknown> | null,
        changedBy: h.changedBy,
        createdAt: h.createdAt,
      })),
      total: history.length,
    };
  }
}
