import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { AlertType, AlertSeverity } from "@prisma/client";
import { AlertDeduplicationService } from "./alert-deduplication.service";
import { AlertContextService } from "./alert-context.service";
import { IncidentAutomationService } from "../incidents/incident-automation.service";
import { SecurityCorrelationService } from "./alert-correlation.service";

interface DetectionRule {
  id: string;
  code: string;
  alertType: AlertType;
  severity: AlertSeverity;
  threshold: number;
  windowMinutes: number;
  autoCreateIncident: boolean;
  incidentSeverityThreshold: AlertSeverity;
  auditEvents: string[];
  auditModules?: string[];
}

@Injectable()
export class AlertEngineService {
  private readonly logger = new Logger(AlertEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly deduplication: AlertDeduplicationService,
    private readonly contextService: AlertContextService,
    private readonly incidentAutomation: IncidentAutomationService,
    private readonly correlationService: SecurityCorrelationService,
  ) {}

  async evaluateRules(): Promise<void> {
    const rules = await this.loadRules();

    for (const rule of rules) {
      await this.evaluateRule(rule);
    }

    await this.correlationService.runCorrelationAnalysis();
  }

  private async loadRules(): Promise<DetectionRule[]> {
    const dbRules = await this.prisma.securityRule.findMany({
      where: { enabled: true },
    });

    return dbRules.map((r) => ({
      id: r.id,
      code: r.code,
      alertType: r.alertType as AlertType,
      severity: r.severity as AlertSeverity,
      threshold: r.threshold,
      windowMinutes: r.windowMinutes,
      autoCreateIncident: r.autoCreateIncident,
      incidentSeverityThreshold: r.incidentSeverityThreshold as AlertSeverity,
      auditEvents: this.mapAlertTypeToEvents(r.alertType as AlertType),
      auditModules: this.mapAlertTypeToModules(r.alertType as AlertType),
    }));
  }

  private async evaluateRule(rule: DetectionRule): Promise<void> {
    const windowStart = new Date(
      Date.now() - rule.windowMinutes * 60 * 1000,
    );

    const whereClause: Record<string, unknown> = {
      createdAt: { gte: windowStart },
    };

    if (rule.auditEvents.length === 1) {
      whereClause.event = rule.auditEvents[0];
    } else {
      whereClause.event = { in: rule.auditEvents };
    }

    if (rule.auditModules && rule.auditModules.length > 0) {
      if (rule.auditModules.length === 1) {
        whereClause.module = rule.auditModules[0];
      } else {
        whereClause.module = { in: rule.auditModules };
      }
    }

    const count = await this.prisma.auditLog.count({
      where: whereClause,
    });

    if (count < rule.threshold) {
      return;
    }

    const baseMetadata: Record<string, unknown> = {
      triggeringEvent: rule.auditEvents.join("/"),
      eventCount: count,
      threshold: rule.threshold,
      windowMinutes: rule.windowMinutes,
    };

    const fingerprint = this.deduplication.generateFingerprint(rule.alertType, baseMetadata);

    const isDuplicate = await this.deduplication.findOrIncrementExisting(
      fingerprint,
      rule.alertType,
      windowStart,
    );

    if (isDuplicate) {
      return;
    }

    const context = await this.contextService.collectContext(
      rule.auditEvents,
      windowStart,
      rule.auditModules,
    );

    const enrichedMetadata = this.contextService.enrichMetadata(baseMetadata, context);

    const dynamicSeverity = this.resolveSeverity(
      rule.alertType,
      rule.severity,
      count,
      rule.threshold,
    );

    await this.createAlert(
      rule,
      dynamicSeverity,
      count,
      enrichedMetadata,
      fingerprint,
    );
  }

  private resolveSeverity(
    alertType: AlertType,
    baseSeverity: AlertSeverity,
    count: number,
    threshold: number,
  ): AlertSeverity {
    if (alertType === "USER_DISABLED_EVENT") {
      if (count >= threshold * 2) return "CRITICAL";
      return baseSeverity;
    }
    if (alertType === "ROLE_ASSIGNMENT_EVENT") {
      if (count >= threshold * 2) return "HIGH";
      return baseSeverity;
    }
    if (alertType === "SECURITY_CONFIGURATION_CHANGED") {
      if (count >= 3) return "HIGH";
      return baseSeverity;
    }
    return baseSeverity;
  }

  private async createAlert(
    rule: DetectionRule,
    severity: AlertSeverity,
    eventCount: number,
    metadata: Record<string, unknown>,
    fingerprint: string,
  ): Promise<void> {
    const title = this.formatTitle(rule.alertType, eventCount);
    const description = `${eventCount} ${rule.auditEvents.join("/")} events detected in the last ${rule.windowMinutes} minutes (threshold: ${rule.threshold})`;

    const createData = this.deduplication.buildCreateData(
      rule.alertType,
      severity,
      title,
      description,
      metadata,
      fingerprint,
    );

    const alert = await this.prisma.securityAlert.create({ data: createData });

    this.logger.warn(
      `SECURITY_ALERT_CREATED type=${rule.alertType} severity=${severity} eventCount=${eventCount}`,
    );

    this.auditService.logSafe({
      event: AuditEvents.SECURITY_ALERT_CREATED,
      module: AuditModules.SECURITY,
      resourceType: "security_alerts",
      resourceId: alert.id,
      metadata: { type: rule.alertType, severity, eventCount, threshold: rule.threshold },
    });

    if (rule.autoCreateIncident) {
      await this.incidentAutomation.maybeCreateIncidentForAlert(
        alert.id,
        severity,
        rule.code,
        rule.incidentSeverityThreshold,
      );
    }
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

  private mapAlertTypeToEvents(alertType: AlertType): string[] {
    const mapping: Record<string, string[]> = {
      FAILED_LOGIN_SPIKE: ["AUTH_LOGIN_FAILED"],
      TWO_FACTOR_FAILURE_SPIKE: ["TWO_FACTOR_FAILED"],
      PERMISSION_DENIED_SPIKE: ["PERMISSION_DENIED"],
      USER_DISABLED_EVENT: ["USER_DISABLED", "USER_SUSPENDED"],
      ROLE_ASSIGNMENT_EVENT: ["USER_ROLE_ASSIGNED", "ROLE_PERMISSION_ASSIGNED"],
      SECURITY_CONFIGURATION_CHANGED: [
        "SYSTEM_SETTING_UPDATED",
        "MAINTENANCE_MODE_ENABLED",
        "MAINTENANCE_MODE_DISABLED",
      ],
    };
    return mapping[alertType] ?? [];
  }

  private mapAlertTypeToModules(alertType: AlertType): string[] | undefined {
    if (alertType === "SECURITY_CONFIGURATION_CHANGED") {
      return ["system", "security"];
    }
    return undefined;
  }
}
