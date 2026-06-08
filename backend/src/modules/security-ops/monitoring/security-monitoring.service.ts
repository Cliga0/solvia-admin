import { Injectable, Logger } from "@nestjs/common";
import { AlertEngineService } from "../alerts/alert-engine.service";
import { RiskScoringService } from "../risk/risk-scoring.service";
import { SecurityRedisService } from "../security-redis.service";
import { EngineExecutionService } from "../engine/engine-execution.service";
import { EngineType } from "@prisma/client";

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);

  constructor(
    private readonly alertEngine: AlertEngineService,
    private readonly riskScoring: RiskScoringService,
    private readonly redisService: SecurityRedisService,
    private readonly executionService: EngineExecutionService,
  ) {}

  async runAlertDetection(): Promise<void> {
    const execution = await this.executionService.startExecution(
      EngineType.ALERT_DETECTION,
    );

    try {
      this.logger.log("Running manual alert detection cycle");
      await this.alertEngine.evaluateRules();
      await this.redisService.invalidateDashboard();
      await this.executionService.completeExecution(execution.id, {
        alertsCreated: 0,
        metadata: { triggeredBy: "manual" },
      });
    } catch (error) {
      await this.executionService.failExecution(
        execution.id,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async runRiskRecalculation(): Promise<number> {
    const execution = await this.executionService.startExecution(
      EngineType.RISK_RECALCULATION,
    );

    try {
      this.logger.log("Running manual risk recalculation cycle");
      const count = await this.riskScoring.recalculateAllUserRisks();
      await this.redisService.invalidateDashboard();
      await this.executionService.completeExecution(execution.id, {
        metadata: { usersRecalculated: count, triggeredBy: "manual" },
      });
      return count;
    } catch (error) {
      await this.executionService.failExecution(
        execution.id,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
