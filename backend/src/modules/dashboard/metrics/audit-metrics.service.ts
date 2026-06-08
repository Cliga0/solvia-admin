import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditOverviewDto } from "../dto";

@Injectable()
export class AuditMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<AuditOverviewDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalLogs, logsToday, logsLast7Days, recentAuditEvents] =
      await Promise.all([
        this.prisma.auditLog.count(),
        this.prisma.auditLog.count({
          where: { createdAt: { gte: todayStart } },
        }),
        this.prisma.auditLog.count({
          where: { createdAt: { gte: last7Days } },
        }),
        this.prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, event: true, module: true, userId: true, createdAt: true },
        }),
      ]);

    return { totalLogs, logsToday, logsLast7Days, recentAuditEvents };
  }
}
