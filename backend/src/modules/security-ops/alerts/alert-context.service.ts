import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

export interface AlertContext {
  topUserId?: string | null;
  topIp?: string | null;
  eventCount: number;
  topEventSource?: string | null;
}

@Injectable()
export class AlertContextService {
  constructor(private readonly prisma: PrismaService) {}

  async collectContext(
    auditEvents: string[],
    windowStart: Date,
    auditModules?: string[],
  ): Promise<AlertContext> {
    const whereBase: Record<string, unknown> = {
      createdAt: { gte: windowStart },
      event: auditEvents.length === 1 ? auditEvents[0] : { in: auditEvents },
    };

    if (auditModules && auditModules.length > 0) {
      whereBase.module = auditModules.length === 1 ? auditModules[0] : { in: auditModules };
    }

    const [topUserResult, topIpResult, eventCount] = await Promise.all([
      this.prisma.auditLog.groupBy({
        by: ["userId"],
        where: { ...whereBase, userId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
      this.prisma.auditLog.groupBy({
        by: ["ip"],
        where: { ...whereBase, ip: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
      this.prisma.auditLog.count({ where: whereBase }),
    ]);

    return {
      topUserId: topUserResult[0]?.userId ?? null,
      topIp: topIpResult[0]?.ip ?? null,
      eventCount,
      topEventSource: auditEvents[0] ?? null,
    };
  }

  enrichMetadata(
    base: Record<string, unknown>,
    context: AlertContext,
  ): Record<string, unknown> {
    return {
      ...base,
      topUserId: context.topUserId,
      topIp: context.topIp,
      eventCount: context.eventCount,
      topEventSource: context.topEventSource,
    };
  }
}
