import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PlatformHealthDto } from "../dto";

@Injectable()
export class PlatformMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<PlatformHealthDto> {
    const [
      activeInternalUsers,
      activeSessions,
      totalRoles,
      totalPermissions,
      maintenanceSetting,
    ] = await Promise.all([
      this.prisma.internalUser.count({
        where: { isActive: true, status: "ACTIVE" },
      }),
      this.prisma.userSession.count({
        where: { isRevoked: false, expiresAt: { gte: new Date() } },
      }),
      this.prisma.role.count(),
      this.prisma.permission.count(),
      this.prisma.systemSetting.findFirst({
        where: { key: "maintenance_enabled" },
        select: { value: true },
      }),
    ]);

    const maintenanceMode = maintenanceSetting?.value === "true";

    return {
      systemStatus: maintenanceMode ? "maintenance" : "healthy",
      maintenanceMode,
      activeInternalUsers,
      activeSessions,
      totalRoles,
      totalPermissions,
    };
  }
}
