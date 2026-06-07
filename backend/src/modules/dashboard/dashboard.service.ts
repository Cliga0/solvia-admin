import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { DashboardRedisService } from "./dashboard-redis.service";
import { AuditEvents, AuditModules } from "@/config";
import {
  DashboardResponseDto,
  PlatformHealthDto,
  SecurityOverviewDto,
  UserOverviewDto,
  AuditOverviewDto,
  ConfigurationOverviewDto,
  QuickActionDto,
} from "./dto";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly redisService: DashboardRedisService,
  ) {}

  async getDashboard(actorUserId: string): Promise<DashboardResponseDto> {
    const cached = await this.redisService.getCachedDashboard();
    if (cached) {
      this.logView(actorUserId);
      return JSON.parse(cached) as DashboardResponseDto;
    }

    const [platform, security, users, audit, settings] = await Promise.all([
      this.getPlatformHealth(),
      this.getSecurityOverview(),
      this.getUserOverview(),
      this.getAuditOverview(),
      this.getConfigurationOverview(),
    ]);

    const quickActions = this.getQuickActions();

    const dashboard: DashboardResponseDto = {
      platform,
      security,
      users,
      audit,
      settings,
      quickActions,
    };

    await this.redisService.cacheDashboard(JSON.stringify(dashboard));

    this.logView(actorUserId);

    return dashboard;
  }

  private async getPlatformHealth(): Promise<PlatformHealthDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

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

  private async getSecurityOverview(): Promise<SecurityOverviewDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalActiveUsers,
      twoFactorEnabledUsers,
      suspendedUsers,
      disabledUsers,
      recentSecurityEvents,
    ] = await Promise.all([
      this.prisma.internalUser.count({
        where: { isActive: true },
      }),
      this.prisma.internalUser.count({
        where: { twoFactorEnabled: true },
      }),
      this.prisma.internalUser.count({
        where: { status: "SUSPENDED" },
      }),
      this.prisma.internalUser.count({
        where: { status: "DISABLED" },
      }),
      this.prisma.auditLog.findMany({
        where: {
          event: {
            in: [
              "AUTH_LOGIN_FAILED",
              "TWO_FACTOR_FAILED",
              "RATE_LIMIT_TRIGGERED",
              "USER_SUSPENDED",
              "USER_DISABLED",
              "PERMISSION_DENIED",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          event: true,
          createdAt: true,
          userId: true,
        },
      }),
    ]);

    const failedLoginsToday = await this.prisma.auditLog.count({
      where: {
        event: "AUTH_LOGIN_FAILED",
        createdAt: { gte: todayStart },
      },
    });

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

  private async getUserOverview(): Promise<UserOverviewDto> {
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
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
        },
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

  private async getAuditOverview(): Promise<AuditOverviewDto> {
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
          select: {
            id: true,
            event: true,
            module: true,
            userId: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      totalLogs,
      logsToday,
      logsLast7Days,
      recentAuditEvents,
    };
  }

  private async getConfigurationOverview(): Promise<ConfigurationOverviewDto> {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "platform_name",
            "support_email",
            "maintenance_enabled",
            "email_enabled",
            "sms_enabled",
            "password_min_length",
            "max_login_attempts",
            "session_timeout",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      platformName: map.get("platform_name") ?? "Solvia",
      supportEmail: map.get("support_email") ?? "",
      maintenanceMode: map.get("maintenance_enabled") === "true",
      notificationsEnabled: map.get("email_enabled") === "true",
      securityProfile: {
        passwordMinLength: parseInt(map.get("password_min_length") ?? "8", 10),
        maxLoginAttempts: parseInt(map.get("max_login_attempts") ?? "10", 10),
        sessionTimeout: parseInt(map.get("session_timeout") ?? "900", 10),
      },
    };
  }

  private getQuickActions(): QuickActionDto[] {
    return [
      { label: "Create User", path: "/users/new", permission: "users.create" },
      { label: "Open Audit", path: "/audit", permission: "audit.read" },
      { label: "Manage Roles", path: "/rbac/roles", permission: "roles.read" },
      { label: "Open Settings", path: "/settings", permission: "system.settings.read" },
    ];
  }

  private logView(actorUserId: string): void {
    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.DASHBOARD_VIEWED,
      module: AuditModules.DASHBOARD,
    });
  }
}
