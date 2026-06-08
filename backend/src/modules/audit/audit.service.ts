import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditLog } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { AuditEvents, AuditEventType } from "@/config/audit-events.constants";
import {
  AuditModules,
  AuditModuleType,
} from "@/config/audit-events.constants";
import {
  CreateAuditLogDto,
  AuditQueryDto,
  AuditSearchResponseDto,
  AuditLogEntryDto,
  AuditPaginationDto,
  AuditStatsDto,
} from "./dto";

const VALID_EVENTS = new Set<string>(Object.values(AuditEvents));
const VALID_MODULES = new Set<string>(Object.values(AuditModules));

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // WRITE METHODS
  // =========================

  async log(dto: CreateAuditLogDto) {
    this.validateEvent(dto.event);
    this.validateModule(dto.module);

    const record = await this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        event: dto.event,
        module: dto.module,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        ip: dto.ip,
        userAgent: dto.userAgent,
        metadata: dto.metadata as InputJsonValue ?? undefined,
      },
    });

    this.logger.debug(
      `AUDIT_WRITE_SUCCESS event=${dto.event} module=${dto.module}`,
    );

    return record;
  }

  logSafe(dto: CreateAuditLogDto): void {
    this.log(dto).catch((err) => {
      this.logger.warn(
        `AUDIT_WRITE_FAILED event=${dto.event} module=${dto.module} error=${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }

  async logMany(dtos: CreateAuditLogDto[]) {
    for (const dto of dtos) {
      this.validateEvent(dto.event);
      this.validateModule(dto.module);
    }

    const records = await this.prisma.auditLog.createMany({
      data: dtos.map((dto) => ({
        userId: dto.userId,
        event: dto.event,
        module: dto.module,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        ip: dto.ip,
        userAgent: dto.userAgent,
        metadata: dto.metadata as InputJsonValue ?? undefined,
      })),
    });

    this.logger.debug(`AuditLog batch created: count=${records.count}`);

    return records;
  }

  // =========================
  // QUERY METHODS
  // =========================

  async search(query: AuditQueryDto): Promise<AuditSearchResponseDto> {
    if (query.event && !VALID_EVENTS.has(query.event)) {
      throw new BadRequestException(
        `Invalid audit event filter: "${query.event}"`,
      );
    }

    if (query.module && !VALID_MODULES.has(query.module)) {
      throw new BadRequestException(
        `Invalid audit module filter: "${query.module}"`,
      );
    }

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    if (dateFrom && isNaN(dateFrom.getTime())) {
      throw new BadRequestException("Invalid dateFrom value");
    }

    if (dateTo && isNaN(dateTo.getTime())) {
      throw new BadRequestException("Invalid dateTo value");
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new BadRequestException("dateFrom must be before dateTo");
    }

    const where = this.buildWhere(query, dateFrom, dateTo);

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const sortDirection = query.sortDirection ?? "desc";

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: sortDirection },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const pagination: AuditPaginationDto = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    const data: AuditLogEntryDto[] = items.map((item: AuditLog) => ({
      id: item.id,
      userId: item.userId,
      event: item.event,
      module: item.module,
      resourceType: item.resourceType,
      resourceId: item.resourceId,
      ip: item.ip,
      userAgent: item.userAgent,
      metadata: item.metadata as Record<string, unknown> | null,
      createdAt: item.createdAt,
    }));

    return { data, pagination };
  }

  async findById(id: string): Promise<AuditLogEntryDto> {
    const record = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException("Audit log not found");
    }

    return {
      id: record.id,
      userId: record.userId,
      event: record.event,
      module: record.module,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      ip: record.ip,
      userAgent: record.userAgent,
      metadata: record.metadata as Record<string, unknown> | null,
      createdAt: record.createdAt,
    };
  }

  async getStats(): Promise<AuditStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalLogs, logsToday, logsLast7Days, logsLast30Days, moduleGroups, eventGroups] =
      await Promise.all([
        this.prisma.auditLog.count(),
        this.prisma.auditLog.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.auditLog.count({ where: { createdAt: { gte: last7Days } } }),
        this.prisma.auditLog.count({ where: { createdAt: { gte: last30Days } } }),
        this.prisma.auditLog.groupBy({
          by: ["module"],
          _count: { module: true },
          orderBy: { _count: { module: "desc" } },
        }),
        this.prisma.auditLog.groupBy({
          by: ["event"],
          _count: { event: true },
          orderBy: { _count: { event: "desc" } },
          take: 20,
        }),
      ]);

    const countByModule: Record<string, number> = {};
    for (const g of moduleGroups) {
      countByModule[g.module] = g._count.module;
    }

    const countByEvent: Record<string, number> = {};
    for (const g of eventGroups) {
      countByEvent[g.event] = g._count.event;
    }

    return {
      totalLogs,
      logsToday,
      logsLast7Days,
      logsLast30Days,
      countByModule,
      countByEvent,
    };
  }

  async count(filters?: {
    event?: AuditEventType;
    module?: AuditModuleType;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
  }): Promise<number> {
    return this.prisma.auditLog.count({
      where: {
        event: filters?.event,
        module: filters?.module,
        userId: filters?.userId,
        resourceType: filters?.resourceType,
        resourceId: filters?.resourceId,
      },
    });
  }

  // =========================
  // PRIVATE HELPERS
  // =========================

  private buildWhere(
    query: AuditQueryDto,
    dateFrom?: Date,
    dateTo?: Date,
  ): Record<string, unknown> {
    const conditions: Record<string, unknown> = {};

    if (query.event) conditions.event = query.event;
    if (query.module) conditions.module = query.module;
    if (query.userId) conditions.userId = query.userId;
    if (query.resourceType) conditions.resourceType = query.resourceType;
    if (query.resourceId) conditions.resourceId = query.resourceId;

    if (dateFrom || dateTo) {
      conditions.createdAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    return conditions;
  }

  private validateEvent(event: string): void {
    if (!VALID_EVENTS.has(event)) {
      throw new BadRequestException(
        `Invalid audit event: "${event}". Must be one of: ${[...VALID_EVENTS].join(", ")}`,
      );
    }
  }

  private validateModule(mod: string): void {
    if (!VALID_MODULES.has(mod)) {
      throw new BadRequestException(
        `Invalid audit module: "${mod}". Must be one of: ${[...VALID_MODULES].join(", ")}`,
      );
    }
  }
}
