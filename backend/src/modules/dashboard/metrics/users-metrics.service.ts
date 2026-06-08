import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { UserOverviewDto } from "../dto";

@Injectable()
export class UsersMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<UserOverviewDto> {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      disabledUsers,
      archivedUsers,
      recentUsers,
    ] = await Promise.all([
      this.prisma.internalUser.count(),
      this.prisma.internalUser.count({ where: { status: "ACTIVE" } }),
      this.prisma.internalUser.count({ where: { status: "PENDING" } }),
      this.prisma.internalUser.count({ where: { status: "SUSPENDED" } }),
      this.prisma.internalUser.count({ where: { status: "DISABLED" } }),
      this.prisma.internalUser.count({ where: { status: "ARCHIVED" } }),
      this.prisma.internalUser.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, email: true, status: true, createdAt: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      disabledUsers,
      archivedUsers,
      recentUsers,
    };
  }
}
