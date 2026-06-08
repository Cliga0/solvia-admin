import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { SecurityRuleHistoryService } from "./security-rule-history.service";

@Injectable()
export class SecurityRulesService {
  private readonly logger = new Logger(SecurityRulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly ruleHistoryService: SecurityRuleHistoryService,
  ) {}

  async findAll() {
    return this.prisma.securityRule.findMany({
      orderBy: { code: "asc" },
    });
  }

  async findById(id: string) {
    const rule = await this.prisma.securityRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException("Security rule not found");
    }
    return rule;
  }

  async update(
    actorUserId: string,
    id: string,
    data: {
      name?: string;
      description?: string;
      severity?: string;
      threshold?: number;
      windowMinutes?: number;
      enabled?: boolean;
      autoCreateIncident?: boolean;
      incidentSeverityThreshold?: string;
    },
  ) {
    const rule = await this.prisma.securityRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException("Security rule not found");
    }

    if (data.threshold !== undefined && data.threshold < 1) {
      throw new BadRequestException("Threshold must be at least 1");
    }

    if (data.windowMinutes !== undefined && data.windowMinutes < 1) {
      throw new BadRequestException("Window minutes must be at least 1");
    }

    const previousConfiguration: Record<string, unknown> = {
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      threshold: rule.threshold,
      windowMinutes: rule.windowMinutes,
      enabled: rule.enabled,
      autoCreateIncident: rule.autoCreateIncident,
      incidentSeverityThreshold: rule.incidentSeverityThreshold,
    };

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.threshold !== undefined) updateData.threshold = data.threshold;
    if (data.windowMinutes !== undefined) updateData.windowMinutes = data.windowMinutes;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.autoCreateIncident !== undefined) updateData.autoCreateIncident = data.autoCreateIncident;
    if (data.incidentSeverityThreshold !== undefined) updateData.incidentSeverityThreshold = data.incidentSeverityThreshold;

    const updated = await this.prisma.securityRule.update({
      where: { id },
      data: updateData,
    });

    await this.ruleHistoryService.recordRuleChange(
      id,
      previousConfiguration,
      updateData,
      actorUserId,
    );

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.SYSTEM_SETTING_UPDATED,
      module: AuditModules.SECURITY,
      resourceType: "security_rules",
      resourceId: id,
      metadata: {
        ruleCode: rule.code,
        changes: data,
      },
    });

    this.logger.log(`SECURITY_RULE_UPDATED id=${id} code=${rule.code}`);

    return updated;
  }
}
