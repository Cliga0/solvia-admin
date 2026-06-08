import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SecurityTimelineDto, TimelineEntryDto } from "../dto";

const TIMELINE_EVENTS = [
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILED",
  "AUTH_LOGOUT",
  "TWO_FACTOR_ENABLED",
  "TWO_FACTOR_DISABLED",
  "TWO_FACTOR_FAILED",
  "TWO_FACTOR_SUCCESS",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_RESET_COMPLETED",
  "USER_SUSPENDED",
  "USER_REACTIVATED",
  "USER_DISABLED",
  "USER_ROLE_ASSIGNED",
  "USER_ROLE_REMOVED",
  "PERMISSION_GRANTED",
  "PERMISSION_DENIED",
  "SECURITY_ALERT_CREATED",
  "SECURITY_INCIDENT_CREATED",
] as const;

@Injectable()
export class SecurityTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTimeline(
    userId: string,
    limit: number = 50,
  ): Promise<SecurityTimelineDto> {
    const events = await this.prisma.auditLog.findMany({
      where: {
        userId,
        event: { in: [...TIMELINE_EVENTS] },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        event: true,
        module: true,
        ip: true,
        metadata: true,
        createdAt: true,
      },
    });

    const entries: TimelineEntryDto[] = events.map((e) => ({
      id: e.id,
      event: e.event,
      module: e.module,
      ip: e.ip,
      metadata: e.metadata as Record<string, unknown> | null,
      createdAt: e.createdAt,
    }));

    return { userId, events: entries };
  }
}
