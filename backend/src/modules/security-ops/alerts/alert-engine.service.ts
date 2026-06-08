import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { AlertType, AlertSeverity } from "@prisma/client";

const DETECTION_WINDOW_MINUTES = 15;

const DETECTION_RULES = {
  FAILED_LOGIN_SPIKE: { event: "AUTH_LOGIN_FAILED", threshold: 10, severity: "HIGH" as const },
  TWO_FACTOR_FAILURE_SPIKE: { event: "TWO_FACTOR_FAILED", threshold: 10, severity: "HIGH" as const },
  PERMISSION_DENIED_SPIKE: { event: "PERMISSION_DENIED", threshold: 20, severity: "MEDIUM" as const },
} as const;

@Injectable()
export class AlertEngineService {
  private readonly logger = new Logger(AlertEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async evaluateRules(): Promise<void> {
    for (const [alertType, rule] of Object.entries(DETECTION_RULES)) {
      await this.evaluateRule(
        alertType as AlertType,
        rule.event,
        rule.threshold,
        rule.severity as AlertSeverity,
      );
    }

    await this.evaluateUserDisabledEvents();
    await this.evaluateRoleAssignmentEvents();
    await this.evaluateSecurityConfigChanges();
  }

  private async evaluateRule(
    alertType: AlertType,
    auditEvent: string,
    threshold: number,
    severity: AlertSeverity,
  ): Promise<void> {
    const windowStart = new Date(
      Date.now() - DETECTION_WINDOW_MINUTES * 60 * 1000,
    );

    const count = await this.prisma.auditLog.count({
      where: {
        event: auditEvent,
        createdAt: { gte: windowStart },
      },
    });

    if (count < threshold) {
      return;
    }

    const existingRecent = await this.prisma.securityAlert.findFirst({
      where: {
        type: alertType,
        status: { in: ["OPEN", "INVESTIGATING"] },
        createdAt: { gte: windowStart },
      },
    });

    if (existingRecent) {
      return;
    }

    await this.createAlert(alertType, severity, auditEvent, count, threshold);
  }

  private async evaluateUserDisabledEvents(): Promise<void> {
    const windowStart = new Date(
      Date.now() - DETECTION_WINDOW_MINUTES * 60 * 1000,
    );

    const count = await this.prisma.auditLog.count({
      where: {
        event: { in: ["USER_DISABLED", "USER_SUSPENDED"] },
        createdAt: { gte: windowStart },
      },
    });

    if (count < 3) return;

    const existingRecent = await this.prisma.securityAlert.findFirst({
      where: {
        type: "USER_DISABLED_EVENT",
        status: { in: ["OPEN", "INVESTIGATING"] },
        createdAt: { gte: windowStart },
      },
    });

    if (existingRecent) return;

    await this.createAlert(
      "USER_DISABLED_EVENT",
      count >= 5 ? "CRITICAL" : "MEDIUM",
      "USER_DISABLED/USER_SUSPENDED",
      count,
      3,
    );
  }

  private async evaluateRoleAssignmentEvents(): Promise<void> {
    const windowStart = new Date(
      Date.now() - DETECTION_WINDOW_MINUTES * 60 * 1000,
    );

    const count = await this.prisma.auditLog.count({
      where: {
        event: { in: ["USER_ROLE_ASSIGNED", "ROLE_PERMISSION_ASSIGNED"] },
        createdAt: { gte: windowStart },
      },
    });

    if (count < 5) return;

    const existingRecent = await this.prisma.securityAlert.findFirst({
      where: {
        type: "ROLE_ASSIGNMENT_EVENT",
        status: { in: ["OPEN", "INVESTIGATING"] },
        createdAt: { gte: windowStart },
      },
    });

    if (existingRecent) return;

    await this.createAlert(
      "ROLE_ASSIGNMENT_EVENT",
      count >= 10 ? "HIGH" : "LOW",
      "USER_ROLE_ASSIGNED/ROLE_PERMISSION_ASSIGNED",
      count,
      5,
    );
  }

  private async evaluateSecurityConfigChanges(): Promise<void> {
    const windowStart = new Date(
      Date.now() - DETECTION_WINDOW_MINUTES * 60 * 1000,
    );

    const count = await this.prisma.auditLog.count({
      where: {
        event: { in: ["SYSTEM_SETTING_UPDATED", "MAINTENANCE_MODE_ENABLED", "MAINTENANCE_MODE_DISABLED"] },
        module: { in: ["system", "security"] },
        createdAt: { gte: windowStart },
      },
    });

    if (count < 1) return;

    const existingRecent = await this.prisma.securityAlert.findFirst({
      where: {
        type: "SECURITY_CONFIGURATION_CHANGED",
        status: { in: ["OPEN", "INVESTIGATING"] },
        createdAt: { gte: windowStart },
      },
    });

    if (existingRecent) return;

    await this.createAlert(
      "SECURITY_CONFIGURATION_CHANGED",
      count >= 3 ? "HIGH" : "MEDIUM",
      "SYSTEM_SETTING_UPDATED",
      count,
      1,
    );
  }

  private async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    triggeringEvent: string,
    eventCount: number,
    threshold: number,
  ): Promise<void> {
    const alert = await this.prisma.securityAlert.create({
      data: {
        type,
        severity,
        title: this.formatTitle(type, eventCount),
        description: `${eventCount} ${triggeringEvent} events detected in the last ${DETECTION_WINDOW_MINUTES} minutes (threshold: ${threshold})`,
        status: "OPEN",
        metadata: {
          triggeringEvent,
          eventCount,
          threshold,
          windowMinutes: DETECTION_WINDOW_MINUTES,
        },
      },
    });

    this.logger.warn(
      `SECURITY_ALERT_CREATED type=${type} severity=${severity} eventCount=${eventCount}`,
    );

    this.auditService.logSafe({
      event: AuditEvents.SECURITY_ALERT_CREATED,
      module: AuditModules.SECURITY,
      resourceType: "security_alerts",
      resourceId: alert.id,
      metadata: { type, severity, eventCount, threshold },
    });
  }

  private formatTitle(type: string, count: number): string {
    const titles: Record<string, string> = {
      FAILED_LOGIN_SPIKE: `Failed Login Spike Detected (${count} events)`,
      TWO_FACTOR_FAILURE_SPIKE: `2FA Failure Spike Detected (${count} events)`,
      PERMISSION_DENIED_SPIKE: `Permission Denied Spike Detected (${count} events)`,
      USER_DISABLED_EVENT: `Multiple User Disabling Events (${count} events)`,
      ROLE_ASSIGNMENT_EVENT: `Unusual Role Assignment Activity (${count} events)`,
      SECURITY_CONFIGURATION_CHANGED: `Security Configuration Changed`,
    };
    return titles[type] ?? `Security Alert: ${type}`;
  }
}
