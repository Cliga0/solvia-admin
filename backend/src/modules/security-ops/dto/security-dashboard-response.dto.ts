import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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

export class SecurityDashboardDto {
  @ApiProperty() openAlerts!: number;
  @ApiProperty() criticalAlerts!: number;
  @ApiProperty() activeIncidents!: number;
  @ApiProperty() highRiskUsers!: number;
  @ApiProperty() failedLoginsToday!: number;
  @ApiProperty() securityEventsToday!: number;
  @ApiProperty({ type: [SecurityDashboardAlertDto] }) recentAlerts!: SecurityDashboardAlertDto[];
  @ApiProperty() engineMetrics!: EngineMetricsDto;
}
