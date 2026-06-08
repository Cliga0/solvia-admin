import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AlertSeverity, AlertType } from "@prisma/client";
import { CorrelationAlertDto } from "../dto";

type CorrelationPattern = {
  type: string;
  description: string;
  severity: AlertSeverity;
  requiredTypes: string[];
};

const CORRELATION_PATTERNS: CorrelationPattern[] = [
  {
    type: "CREDENTIAL_ATTACK_SUSPECTED",
    description: "Failed login spike combined with 2FA failures detected — credential attack suspected",
    severity: "CRITICAL",
    requiredTypes: ["FAILED_LOGIN_SPIKE", "TWO_FACTOR_FAILURE_SPIKE"],
  },
  {
    type: "PRIVILEGE_ESCALATION_SUSPECTED",
    description: "Role assignment event combined with security configuration changes — privilege escalation suspected",
    severity: "HIGH",
    requiredTypes: ["ROLE_ASSIGNMENT_EVENT", "SECURITY_CONFIGURATION_CHANGED"],
  },
  {
    type: "ADMINISTRATIVE_ABUSE_SUSPECTED",
    description: "User disabling events combined with permission denials — administrative abuse suspected",
    severity: "HIGH",
    requiredTypes: ["USER_DISABLED_EVENT", "PERMISSION_DENIED_SPIKE"],
  },
];

@Injectable()
export class SecurityCorrelationService {
  private readonly logger = new Logger(SecurityCorrelationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runCorrelationAnalysis(): Promise<void> {
    const windowStart = new Date(Date.now() - 60 * 60 * 1000);

    const recentAlerts = await this.prisma.securityAlert.findMany({
      where: {
        status: { in: ["OPEN", "INVESTIGATING"] },
        createdAt: { gte: windowStart },
      },
      select: { id: true, type: true },
    });

    const presentTypes = new Set<AlertType>(recentAlerts.map((a) => a.type));

    for (const pattern of CORRELATION_PATTERNS) {
      const allPresent = pattern.requiredTypes.every((t) => presentTypes.has(t as AlertType));
      if (!allPresent) continue;

      const existingRecent = await this.prisma.correlationAlert.findFirst({
        where: {
          type: pattern.type,
          status: { in: ["OPEN", "INVESTIGATING"] },
          createdAt: { gte: windowStart },
        },
      });

      if (existingRecent) continue;

      const sourceAlerts = recentAlerts
        .filter((a) => pattern.requiredTypes.includes(a.type))
        .map((a) => a.id);

      await this.prisma.correlationAlert.create({
        data: {
          type: pattern.type,
          severity: pattern.severity,
          sourceAlerts,
          description: pattern.description,
          status: "OPEN",
        },
      });

      this.logger.warn(
        `CORRELATION_ALERT_CREATED type=${pattern.type} severity=${pattern.severity} sources=${sourceAlerts.length}`,
      );
    }
  }

  async getOpenCorrelations(limit = 10): Promise<CorrelationAlertDto[]> {
    const alerts = await this.prisma.correlationAlert.findMany({
      where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return alerts.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      sourceAlerts: a.sourceAlerts,
      description: a.description,
      status: a.status,
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt,
    }));
  }
}
