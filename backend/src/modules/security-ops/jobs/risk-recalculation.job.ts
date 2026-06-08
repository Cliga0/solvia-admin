import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { RiskScoringService } from "../risk/risk-scoring.service";
import { EngineExecutionService } from "../engine/engine-execution.service";
import { SecurityRedisService } from "../security-redis.service";
import { EngineType } from "@prisma/client";

@Injectable()
export class RiskRecalculationJob {
  private readonly logger = new Logger(RiskRecalculationJob.name);

  constructor(
    private readonly riskScoring: RiskScoringService,
    private readonly executionService: EngineExecutionService,
    private readonly redisService: SecurityRedisService,
  ) {}

  @Cron("0 * * * *")
  async handleCron(): Promise<void> {
    await this.run();
  }

  async run(): Promise<void> {
    const execution = await this.executionService.startExecution(
      EngineType.RISK_RECALCULATION,
    );

    try {
      const usersRecalculated =
        await this.riskScoring.recalculateAllUserRisks();

      await this.executionService.completeExecution(execution.id, {
        metadata: { usersRecalculated },
      });

      await this.redisService.invalidateDashboard();

      this.logger.log(
        `RISK_RECALCULATION_JOB_COMPLETE usersRecalculated=${usersRecalculated}`,
      );
    } catch (error) {
      await this.executionService.failExecution(
        execution.id,
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        `RISK_RECALCULATION_JOB_FAILED: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
