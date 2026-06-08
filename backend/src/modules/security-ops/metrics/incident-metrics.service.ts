import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class IncidentMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getIncidentsByStatus(): Promise<Record<string, number>> {
    const groups = await this.prisma.securityIncident.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const result: Record<string, number> = {};
    for (const g of groups) {
      result[g.status] = g._count.status;
    }
    return result;
  }
}
