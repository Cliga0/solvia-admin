import { Injectable } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { DashboardRedisService } from "./dashboard-redis.service";
import { PlatformMetricsService } from "./metrics/platform-metrics.service";
import { SecurityMetricsService } from "./metrics/security-metrics.service";
import { UsersMetricsService } from "./metrics/users-metrics.service";
import { AuditMetricsService } from "./metrics/audit-metrics.service";
import { SystemMetricsService } from "./metrics/system-metrics.service";
import { AuditEvents, AuditModules } from "@/config";
import { DashboardResponseDto, QuickActionDto } from "./dto";

@Injectable()
export class DashboardService {
  constructor(
    private readonly auditService: AuditService,
    private readonly redisService: DashboardRedisService,
    private readonly platformMetrics: PlatformMetricsService,
    private readonly securityMetrics: SecurityMetricsService,
    private readonly usersMetrics: UsersMetricsService,
    private readonly auditMetrics: AuditMetricsService,
    private readonly systemMetrics: SystemMetricsService,
  ) {}

  async getDashboard(actorUserId: string): Promise<DashboardResponseDto> {
    const cached = await this.redisService.getCachedDashboard();
    if (cached) {
      this.logView(actorUserId);
      return JSON.parse(cached) as DashboardResponseDto;
    }

    const [platform, security, users, audit, settings] = await Promise.all([
      this.platformMetrics.getOverview(),
      this.securityMetrics.getOverview(),
      this.usersMetrics.getOverview(),
      this.auditMetrics.getOverview(),
      this.systemMetrics.getOverview(),
    ]);

    const dashboard: DashboardResponseDto = {
      platform,
      security,
      users,
      audit,
      settings,
      quickActions: this.getQuickActions(),
    };

    await this.redisService.cacheDashboard(JSON.stringify(dashboard));

    this.logView(actorUserId);

    return dashboard;
  }

  private getQuickActions(): QuickActionDto[] {
    return [
      { label: "Create User", path: "/users/new", permission: "users.create" },
      { label: "Open Audit", path: "/audit", permission: "audit.read" },
      { label: "Manage Roles", path: "/rbac/roles", permission: "roles.read" },
      {
        label: "Open Settings",
        path: "/settings",
        permission: "system.settings.read",
      },
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
