import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { GlobalTimelineQueryDto, GlobalTimelineEntryDto, GlobalTimelineResponseDto } from "../dto";

@Injectable()
export class SecurityGlobalTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalTimeline(query: GlobalTimelineQueryDto): Promise<GlobalTimelineResponseDto> {
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    const where: Record<string, unknown> = {};

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) (where.createdAt as Record<string, unknown>).gte = new Date(query.from);
      if (query.to) (where.createdAt as Record<string, unknown>).lte = new Date(query.to);
    }

    if (query.module) {
      where.module = query.module;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.event) {
      where.event = { contains: query.event, mode: "insensitive" };
    }

    const [entries, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const data: GlobalTimelineEntryDto[] = entries.map((e) => ({
      id: e.id,
      event: e.event,
      module: e.module,
      userId: e.userId,
      userEmail: e.user?.email ?? null,
      resourceType: e.resourceType,
      resourceId: e.resourceId,
      ip: e.ip,
      metadata: e.metadata as Record<string, unknown> | null,
      createdAt: e.createdAt,
    }));

    return {
      data,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getPreview(limit = 10): Promise<GlobalTimelineEntryDto[]> {
    const entries = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { email: true } },
      },
    });

    return entries.map((e) => ({
      id: e.id,
      event: e.event,
      module: e.module,
      userId: e.userId,
      userEmail: e.user?.email ?? null,
      resourceType: e.resourceType,
      resourceId: e.resourceId,
      ip: e.ip,
      metadata: e.metadata as Record<string, unknown> | null,
      createdAt: e.createdAt,
    }));
  }
}
