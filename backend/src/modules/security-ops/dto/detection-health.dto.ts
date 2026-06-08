import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RulePerformanceDto {
  @ApiProperty() ruleCode!: string;
  @ApiProperty() ruleName!: string;
  @ApiProperty() alertsGenerated!: number;
  @ApiProperty() enabled!: boolean;
}

export class DetectionHealthMetricsDto {
  @ApiProperty() rulesExecuted!: number;
  @ApiProperty() rulesEnabled!: number;
  @ApiProperty() rulesDisabled!: number;
  @ApiProperty() alertsGenerated!: number;
  @ApiProperty() incidentsGenerated!: number;
  @ApiProperty() averageExecutionTimeMs!: number;
  @ApiPropertyOptional() lastExecutionTime?: Date | null;
  @ApiProperty() engineHealthStatus!: string;
  @ApiProperty({ type: [RulePerformanceDto] }) topTriggeredRules!: RulePerformanceDto[];
}
