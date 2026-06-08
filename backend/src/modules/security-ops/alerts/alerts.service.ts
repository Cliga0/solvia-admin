import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { AlertStatus } from "@prisma/client";
import {
  AlertQueryDto,
  AlertDto,
  AlertSearchResponseDto,
  AlertPaginationDto,
  UpdateAlertDto,
} from "../dto";

const VALID_TYPES = new Set<string>([
  "FAILED_LOGIN_SPIKE",
  "TWO_FACTOR_FAILURE_SPIKE",
  "PERMISSION_DENIED_SPIKE",
  "USER_DISABLED_EVENT",
  "ROLE_ASSIGNMENT_EVENT",
  "SECURITY_CONFIGURATION_CHANGED",
]);

const VALID_SEVERITIES = new Set<string>(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const VALID_STATUSES = new Set<string>(["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"]);

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async search(query: AlertQueryDto): Promise<AlertSearchResponseDto> {
    if (query.type && !VALID_TYPES.has(query.type)) {
      throw new BadRequestException(`Invalid alert type: "${query.type}"`);
    }
    if (query.severity && !VALID_SEVERITIES.has(query.severity)) {
      throw new BadRequestException(`Invalid severity: "${query.severity}"`);
    }
    if (query.status && !VALID_STATUSES.has(query.status)) {
      throw new BadRequestException(`Invalid status: "${query.status}"`);
    }

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const where = this.buildWhere(query, dateFrom, dateTo);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const sortDirection = query.sortDirection ?? "desc";

    const [items, total] = await Promise.all([
      this.prisma.securityAlert.findMany({
        where,
        orderBy: { createdAt: sortDirection },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          resolver: { select: { email: true } },
        },
      }),
      this.prisma.securityAlert.count({ where }),
    ]);

    const pagination: AlertPaginationDto = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return {
      data: items.map((item) => this.toDto(item)),
      pagination,
    };
  }

  async findById(id: string): Promise<AlertDto> {
    const alert = await this.prisma.securityAlert.findUnique({
      where: { id },
      include: {
        resolver: { select: { email: true } },
      },
    });
    if (!alert) {
      throw new NotFoundException("Security alert not found");
    }
    return this.toDto(alert);
  }

  async update(
    actorUserId: string,
    id: string,
    dto: UpdateAlertDto,
  ): Promise<AlertDto> {
    const alert = await this.prisma.securityAlert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundException("Security alert not found");
    }

    const isResolved =
      dto.status === "RESOLVED" || dto.status === "FALSE_POSITIVE";

    const resolvedAt = isResolved ? new Date() : alert.resolvedAt;
    const resolvedBy = isResolved ? actorUserId : alert.resolvedBy;
    const resolvedByUserId = isResolved ? actorUserId : alert.resolvedByUserId;
    const resolutionReason = isResolved
      ? (dto.resolutionReason ?? alert.resolutionReason)
      : alert.resolutionReason;
    const resolutionNotes = isResolved
      ? (dto.resolutionNotes ?? alert.resolutionNotes)
      : alert.resolutionNotes;

    const updated = await this.prisma.securityAlert.update({
      where: { id },
      data: {
        status: dto.status as AlertStatus,
        description: dto.description ?? alert.description,
        resolvedAt,
        resolvedBy,
        resolvedByUserId,
        resolutionReason,
        resolutionNotes,
      },
      include: {
        resolver: { select: { email: true } },
      },
    });

    if (isResolved) {
      this.auditService.logSafe({
        userId: actorUserId,
        event: AuditEvents.SECURITY_ALERT_RESOLVED,
        module: AuditModules.SECURITY,
        resourceType: "security_alerts",
        resourceId: id,
        metadata: {
          newStatus: dto.status,
          alertType: alert.type,
          resolutionReason: dto.resolutionReason,
        },
      });
    }

    this.logger.log(`SECURITY_ALERT_UPDATED id=${id} status=${dto.status}`);

    return this.toDto(updated);
  }

  private buildWhere(
    query: AlertQueryDto,
    dateFrom?: Date,
    dateTo?: Date,
  ): Record<string, unknown> {
    const conditions: Record<string, unknown> = {};

    if (query.type) conditions.type = query.type;
    if (query.severity) conditions.severity = query.severity;
    if (query.status) conditions.status = query.status;

    if (dateFrom || dateTo) {
      conditions.createdAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    return conditions;
  }

  private toDto(
    alert: Record<string, unknown> & {
      id: string;
      type: string;
      severity: string;
      title: string;
      description?: string | null;
      status: string;
      metadata?: unknown;
      createdAt: Date;
      resolvedAt?: Date | null;
      resolvedBy?: string | null;
      resolvedByUserId?: string | null;
      resolutionReason?: string | null;
      resolutionNotes?: string | null;
      resolver?: { email: string } | null;
    },
  ): AlertDto {
    return {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      status: alert.status,
      metadata: alert.metadata as Record<string, unknown> | null,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy,
      resolvedByUserId: alert.resolvedByUserId,
      resolvedByEmail: alert.resolver?.email ?? null,
      resolutionReason: alert.resolutionReason,
      resolutionNotes: alert.resolutionNotes,
    };
  }
}
