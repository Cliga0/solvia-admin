import { Injectable, Logger } from "@nestjs/common";
import { AlertEngineService } from "../alerts/alert-engine.service";
import { RiskScoringService } from "../risk/risk-scoring.service";
import { SecurityRedisService } from "../security-redis.service";

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);

  constructor(
    private readonly alertEngine: AlertEngineService,
    private readonly riskScoring: RiskScoringService,
    private readonly redisService: SecurityRedisService,
  ) {}

  async runAlertDetection(): Promise<void> {
    this.logger.log("Running alert detection cycle");
    await this.alertEngine.evaluateRules();
    await this.redisService.invalidateDashboard();
  }

  async runRiskRecalculation(): Promise<number> {
    this.logger.log("Running risk recalculation cycle");
    const count = await this.riskScoring.recalculateAllUserRisks();
    await this.redisService.invalidateDashboard();
    return count;
  }
}
