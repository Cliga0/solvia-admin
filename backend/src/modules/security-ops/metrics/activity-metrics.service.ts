import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

const SECURITY_EVENT_TYPES = [
  "AUTH_LOGIN_FAILED",
  "TWO_FACTOR_FAILED",
  "PERMISSION_DENIED",
  "SECURITY_ALERT_CREATED",
  "SECURITY_INCIDENT_CREATED",
  "USER_SUSPENDED",
  "USER_DISABLED",
] as const;

@Injectable()
export class ActivityMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSecurityEventsToday(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return this.prisma.auditLog.count({
      where: {
        event: { in: [...SECURITY_EVENT_TYPES] },
        createdAt: { gte: todayStart },
      },
    });
  }

  async getFailedLoginsToday(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return this.prisma.auditLog.count({
      where: {
        event: "AUTH_LOGIN_FAILED",
        createdAt: { gte: todayStart },
      },
    });
  }
}
