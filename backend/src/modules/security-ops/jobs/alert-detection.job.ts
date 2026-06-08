import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "@/prisma/prisma.service";
import { AlertEngineService } from "../alerts/alert-engine.service";
import { EngineExecutionService } from "../engine/engine-execution.service";
import { SecurityRedisService } from "../security-redis.service";
import { EngineType } from "@prisma/client";

@Injectable()
export class AlertDetectionJob {
  private readonly logger = new Logger(AlertDetectionJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertEngine: AlertEngineService,
    private readonly executionService: EngineExecutionService,
    private readonly redisService: SecurityRedisService,
  ) {}

  @Cron("*/5 * * * *")
  async handleCron(): Promise<void> {
    await this.run();
  }

  async run(): Promise<void> {
    const execution = await this.executionService.startExecution(
      EngineType.ALERT_DETECTION,
    );

    try {
      const alertCountBefore = await this.prisma.securityAlert.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      });

      await this.alertEngine.evaluateRules();

      const alertCountAfter = await this.prisma.securityAlert.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      });

      const alertsCreated = Math.max(0, alertCountAfter - alertCountBefore);

      await this.executionService.completeExecution(execution.id, {
        alertsCreated,
      });

      await this.redisService.invalidateDashboard();

      this.logger.log(
        `ALERT_DETECTION_JOB_COMPLETE alertsCreated=${alertsCreated}`,
      );
    } catch (error) {
      await this.executionService.failExecution(
        execution.id,
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        `ALERT_DETECTION_JOB_FAILED: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
