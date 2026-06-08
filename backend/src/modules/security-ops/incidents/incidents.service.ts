import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { IncidentStatus } from "@prisma/client";
import {
  IncidentQueryDto,
  IncidentDto,
  IncidentSearchResponseDto,
  IncidentPaginationDto,
  CreateIncidentDto,
  UpdateIncidentDto,
} from "../dto";

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async search(query: IncidentQueryDto): Promise<IncidentSearchResponseDto> {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const where = this.buildWhere(query, dateFrom, dateTo);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const sortDirection = query.sortDirection ?? "desc";

    const [items, total] = await Promise.all([
      this.prisma.securityIncident.findMany({
        where,
        orderBy: { createdAt: sortDirection },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignee: { select: { email: true } },
        },
      }),
      this.prisma.securityIncident.count({ where }),
    ]);

    const pagination: IncidentPaginationDto = {
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

  async findById(id: string): Promise<IncidentDto> {
    const incident = await this.prisma.securityIncident.findUnique({
      where: { id },
      include: {
        assignee: { select: { email: true } },
      },
    });
    if (!incident) {
      throw new NotFoundException("Security incident not found");
    }
    return this.toDto(incident);
  }

  async create(
    actorUserId: string,
    dto: CreateIncidentDto,
  ): Promise<IncidentDto> {
    if (dto.alertId) {
      const alert = await this.prisma.securityAlert.findUnique({
        where: { id: dto.alertId },
      });
      if (!alert) {
        throw new NotFoundException("Referenced alert not found");
      }
    }

    const incident = await this.prisma.securityIncident.create({
      data: {
        alertId: dto.alertId ?? null,
        status: "OPEN",
        assignedTo: dto.assignedTo ?? null,
        assignedToUserId: dto.assignedTo ?? null,
        notes: dto.notes ?? null,
      },
      include: {
        assignee: { select: { email: true } },
      },
    });

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.SECURITY_INCIDENT_CREATED,
      module: AuditModules.SECURITY,
      resourceType: "security_incidents",
      resourceId: incident.id,
      metadata: { alertId: dto.alertId, assignedTo: dto.assignedTo },
    });

    this.logger.log(`SECURITY_INCIDENT_CREATED id=${incident.id}`);

    return this.toDto(incident);
  }

  async update(
    actorUserId: string,
    id: string,
    dto: UpdateIncidentDto,
  ): Promise<IncidentDto> {
    const incident = await this.prisma.securityIncident.findUnique({
      where: { id },
    });
    if (!incident) {
      throw new NotFoundException("Security incident not found");
    }

    const resolvedAt =
      dto.status === "RESOLVED" ? new Date() : incident.resolvedAt;

    const assignedToUserId = dto.assignedTo ?? incident.assignedToUserId;

    const updated = await this.prisma.securityIncident.update({
      where: { id },
      data: {
        status: dto.status as IncidentStatus,
        assignedTo: dto.assignedTo ?? incident.assignedTo,
        assignedToUserId,
        notes: dto.notes ?? incident.notes,
        resolvedAt,
      },
      include: {
        assignee: { select: { email: true } },
      },
    });

    if (dto.assignedTo && dto.assignedTo !== incident.assignedTo) {
      this.auditService.logSafe({
        userId: actorUserId,
        event: AuditEvents.SECURITY_INCIDENT_ASSIGNED,
        module: AuditModules.SECURITY,
        resourceType: "security_incidents",
        resourceId: id,
        metadata: { assignedTo: dto.assignedTo },
      });
    }

    if (dto.status === "RESOLVED") {
      this.auditService.logSafe({
        userId: actorUserId,
        event: AuditEvents.SECURITY_INCIDENT_RESOLVED,
        module: AuditModules.SECURITY,
        resourceType: "security_incidents",
        resourceId: id,
      });
    }

    this.logger.log(`SECURITY_INCIDENT_UPDATED id=${id} status=${dto.status}`);

    return this.toDto(updated);
  }

  private buildWhere(
    query: IncidentQueryDto,
    dateFrom?: Date,
    dateTo?: Date,
  ): Record<string, unknown> {
    const conditions: Record<string, unknown> = {};

    if (query.status) conditions.status = query.status;
    if (query.assignedTo) conditions.assignedTo = query.assignedTo;
    if (query.alertId) conditions.alertId = query.alertId;

    if (dateFrom || dateTo) {
      conditions.createdAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    return conditions;
  }

  private toDto(
    incident: Record<string, unknown> & {
      id: string;
      alertId?: string | null;
      status: string;
      assignedTo?: string | null;
      assignedToUserId?: string | null;
      notes?: string | null;
      createdAt: Date;
      resolvedAt?: Date | null;
      assignee?: { email: string } | null;
    },
  ): IncidentDto {
    return {
      id: incident.id,
      alertId: incident.alertId,
      status: incident.status,
      assignedTo: incident.assignedTo,
      assignedToUserId: incident.assignedToUserId,
      assignedToEmail: incident.assignee?.email ?? null,
      notes: incident.notes,
      createdAt: incident.createdAt,
      resolvedAt: incident.resolvedAt,
    };
  }
}
