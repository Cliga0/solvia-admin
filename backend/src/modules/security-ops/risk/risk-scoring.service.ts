import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { AuditEvents, AuditModules } from "@/config";
import { RiskLevel } from "@prisma/client";
import { SecurityRedisService } from "../security-redis.service";
import { RiskBreakdownDto, UserRiskProfileWithBreakdownDto } from "../dto";

const RISK_WINDOW_DAYS = 30;

const SCORING_WEIGHTS = {
  FAILED_LOGIN: 3,
  TWO_FACTOR_FAILURE: 5,
  PASSWORD_RESET: 2,
  ROLE_CHANGE: 4,
  ACCOUNT_DISABLED: 8,
  SECURITY_INCIDENT: 15,
} as const;

const MAX_SCORE = 100;

interface RiskCalculationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  breakdown: RiskBreakdownDto;
}

@Injectable()
export class RiskScoringService {
  private readonly logger = new Logger(RiskScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly redisService: SecurityRedisService,
  ) {}

  async calculateUserRisk(userId: string): Promise<RiskCalculationResult> {
    const windowStart = new Date(
      Date.now() - RISK_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    const [
      failedLogins,
      twoFactorFailures,
      passwordResets,
      roleChanges,
      accountDisabled,
      securityIncidents,
    ] = await Promise.all([
      this.prisma.auditLog.count({
        where: {
          userId,
          event: "AUTH_LOGIN_FAILED",
          createdAt: { gte: windowStart },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          userId,
          event: "TWO_FACTOR_FAILED",
          createdAt: { gte: windowStart },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          userId,
          event: { in: ["PASSWORD_RESET_REQUESTED", "PASSWORD_RESET_COMPLETED"] },
          createdAt: { gte: windowStart },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          userId,
          event: { in: ["USER_ROLE_ASSIGNED", "USER_ROLE_REMOVED"] },
          createdAt: { gte: windowStart },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          userId,
          event: { in: ["USER_DISABLED", "USER_SUSPENDED"] },
          createdAt: { gte: windowStart },
        },
      }),
      this.getIncidentCountForUser(userId, windowStart),
    ]);

    const breakdown: RiskBreakdownDto = {
      failedLogins,
      twoFactorFailures,
      passwordResets,
      roleChanges,
      accountDisabled,
      securityIncidents,
    };

    const rawScore =
      failedLogins * SCORING_WEIGHTS.FAILED_LOGIN +
      twoFactorFailures * SCORING_WEIGHTS.TWO_FACTOR_FAILURE +
      passwordResets * SCORING_WEIGHTS.PASSWORD_RESET +
      roleChanges * SCORING_WEIGHTS.ROLE_CHANGE +
      accountDisabled * SCORING_WEIGHTS.ACCOUNT_DISABLED +
      securityIncidents * SCORING_WEIGHTS.SECURITY_INCIDENT;

    const riskScore = Math.min(rawScore, MAX_SCORE);
    const riskLevel = this.scoreToLevel(riskScore);

    await this.prisma.userRiskProfile.upsert({
      where: { userId },
      update: { riskScore, riskLevel, lastCalculatedAt: new Date() },
      create: { userId, riskScore, riskLevel },
    });

    await this.redisService.invalidateRiskProfile(userId);

    this.auditService.logSafe({
      userId,
      event: AuditEvents.USER_RISK_RECALCULATED,
      module: AuditModules.SECURITY,
      resourceType: "user_risk_profiles",
      resourceId: userId,
      metadata: { riskScore, riskLevel },
    });

    this.logger.log(
      `USER_RISK_RECALCULATED userId=${userId} score=${riskScore} level=${riskLevel}`,
    );

    return { riskScore, riskLevel, breakdown };
  }

  async getUserRiskProfile(userId: string): Promise<UserRiskProfileWithBreakdownDto> {
    const cached = await this.redisService.getCachedRiskProfile(userId);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.calculateUserRisk(userId);

    const dto: UserRiskProfileWithBreakdownDto = {
      userId,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      lastCalculatedAt: new Date(),
      breakdown: result.breakdown,
    };

    await this.redisService.cacheRiskProfile(userId, JSON.stringify(dto));

    return dto;
  }

  async recalculateAllUserRisks(): Promise<number> {
    const users = await this.prisma.internalUser.findMany({
      select: { id: true },
    });

    let count = 0;
    for (const user of users) {
      await this.calculateUserRisk(user.id);
      count++;
    }

    this.logger.log(`RISK_RECALCULATED_ALL count=${count}`);
    return count;
  }

  private async getIncidentCountForUser(
    userId: string,
    since: Date,
  ): Promise<number> {
    return this.prisma.auditLog.count({
      where: {
        userId,
        event: { in: ["SECURITY_ALERT_CREATED", "SECURITY_INCIDENT_CREATED"] },
        createdAt: { gte: since },
      },
    });
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score <= 25) return "LOW";
    if (score <= 50) return "MEDIUM";
    if (score <= 75) return "HIGH";
    return "CRITICAL";
  }
}
