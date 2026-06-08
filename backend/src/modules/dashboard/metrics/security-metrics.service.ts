import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SecurityOverviewDto } from "../dto";

const SECURITY_EVENTS = [
  "AUTH_LOGIN_FAILED",
  "TWO_FACTOR_FAILED",
  "RATE_LIMIT_TRIGGERED",
  "USER_SUSPENDED",
  "USER_DISABLED",
  "PERMISSION_DENIED",
] as const;

@Injectable()
export class SecurityMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<SecurityOverviewDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalActiveUsers,
      twoFactorEnabledUsers,
      suspendedUsers,
      disabledUsers,
      recentSecurityEvents,
      failedLoginsToday,
    ] = await Promise.all([
      this.prisma.internalUser.count({ where: { isActive: true } }),
      this.prisma.internalUser.count({ where: { twoFactorEnabled: true } }),
      this.prisma.internalUser.count({ where: { status: "SUSPENDED" } }),
      this.prisma.internalUser.count({ where: { status: "DISABLED" } }),
      this.prisma.auditLog.findMany({
        where: { event: { in: [...SECURITY_EVENTS] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { event: true, createdAt: true, userId: true },
      }),
      this.prisma.auditLog.count({
        where: {
          event: "AUTH_LOGIN_FAILED",
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    const twoFactorAdoptionRate =
      totalActiveUsers > 0
        ? Math.round((twoFactorEnabledUsers / totalActiveUsers) * 1000) / 10
        : 0;

    return {
      failedLoginsToday,
      twoFactorEnabledUsers,
      twoFactorAdoptionRate,
      suspendedUsers,
      disabledUsers,
      recentSecurityEvents,
    };
  }
}
