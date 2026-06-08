import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { AlertSeverity } from "@prisma/client";

@Injectable()
export class IncidentAutomationService {
  private readonly logger = new Logger(IncidentAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async maybeCreateIncidentForAlert(
    alertId: string,
    alertSeverity: AlertSeverity,
    ruleCode: string,
    incidentSeverityThreshold: AlertSeverity,
  ): Promise<void> {
    const severityRank: Record<AlertSeverity, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };

    if (severityRank[alertSeverity] < severityRank[incidentSeverityThreshold]) {
      return;
    }

    const existing = await this.prisma.securityIncident.findFirst({
      where: {
        alertId,
        status: { in: ["OPEN", "INVESTIGATING"] },
      },
    });

    if (existing) {
      return;
    }

    const incident = await this.prisma.securityIncident.create({
      data: {
        alertId,
        status: "OPEN",
        notes: `Auto-created by detection rule: ${ruleCode}`,
      },
    });

    this.logger.warn(
      `INCIDENT_AUTO_CREATED incidentId=${incident.id} alertId=${alertId} ruleCode=${ruleCode}`,
    );

    this.auditService.logSafe({
      event: AuditEvents.SECURITY_INCIDENT_CREATED,
      module: AuditModules.SECURITY,
      resourceType: "security_incidents",
      resourceId: incident.id,
      metadata: { alertId, ruleCode, autoCreated: true },
    });
  }
}
