import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DetectionHealthMetricsDto } from "./detection-health.dto";
import { SecurityKpiDto } from "./security-kpi.dto";
import { CorrelationAlertDto } from "./correlation-alert.dto";
import { GlobalTimelineEntryDto } from "./global-timeline.dto";
import { RiskTrendDto } from "./user-risk-history.dto";

export class SecurityDashboardAlertDto {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() severity!: string;
  @ApiProperty() title!: string;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: Date;
}

export class SecurityDashboardIncidentDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() alertId?: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() assignedTo?: string | null;
  @ApiProperty() createdAt!: Date;
}

export class SecurityDashboardRiskUserDto {
  @ApiProperty() userId!: string;
  @ApiProperty() riskScore!: number;
  @ApiProperty() riskLevel!: string;
  @ApiProperty() lastCalculatedAt!: Date;
}

export class EngineMetricsDto {
  @ApiPropertyOptional() lastDetectionRun!: Date | null;
  @ApiPropertyOptional() lastRiskCalculationRun!: Date | null;
  @ApiProperty() alertsCreatedToday!: number;
  @ApiProperty() detectionEngineStatus!: string;
  @ApiProperty() riskEngineStatus!: string;
}

export class TopAlertSourceDto {
  @ApiProperty() key!: string;
  @ApiProperty() count!: number;
}

export class SecurityDashboardDto {
  @ApiProperty() openAlerts!: number;
  @ApiProperty() criticalAlerts!: number;
  @ApiProperty() activeIncidents!: number;
  @ApiProperty() highRiskUsers!: number;
  @ApiProperty() failedLoginsToday!: number;
  @ApiProperty() securityEventsToday!: number;
  @ApiProperty({ type: [SecurityDashboardAlertDto] }) recentAlerts!: SecurityDashboardAlertDto[];
  @ApiProperty() engineMetrics!: EngineMetricsDto;
  @ApiProperty() alertsBySeverity!: Record<string, number>;
  @ApiProperty() alertsByType!: Record<string, number>;
  @ApiProperty() incidentsByStatus!: Record<string, number>;
  @ApiProperty() riskDistribution!: Record<string, number>;
  @ApiProperty() alertsLast24Hours!: number;
  @ApiProperty() alertsLast7Days!: number;
  @ApiPropertyOptional() detectionHealth?: DetectionHealthMetricsDto | null;
  @ApiPropertyOptional() kpis?: SecurityKpiDto | null;
  @ApiProperty({ type: [RiskTrendDto] }) riskTrend!: RiskTrendDto[];
  @ApiProperty({ type: [CorrelationAlertDto] }) correlationAlerts!: CorrelationAlertDto[];
  @ApiProperty({ type: [GlobalTimelineEntryDto] }) globalTimelineFeed!: GlobalTimelineEntryDto[];
  @ApiProperty({ type: [SecurityDashboardRiskUserDto] }) topRiskUsers!: SecurityDashboardRiskUserDto[];
  @ApiProperty({ type: [TopAlertSourceDto] }) topAlertSources!: TopAlertSourceDto[];
  @ApiProperty({ type: [TopAlertSourceDto] }) topActiveIps!: TopAlertSourceDto[];
  @ApiProperty({ type: [TopAlertSourceDto] }) mostTriggeredRules!: TopAlertSourceDto[];
}
