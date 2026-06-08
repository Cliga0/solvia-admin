import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SecurityKpiDto {
  @ApiPropertyOptional() meanTimeToDetectMs?: number | null;
  @ApiPropertyOptional() meanTimeToResolveMs?: number | null;
  @ApiProperty() alertsToday!: number;
  @ApiProperty() alertsLast7Days!: number;
  @ApiProperty() criticalAlertsToday!: number;
  @ApiProperty() openIncidents!: number;
  @ApiProperty() resolvedIncidentsToday!: number;
  @ApiProperty() alertGrowthRate!: number;
  @ApiProperty() incidentGrowthRate!: number;
  @ApiProperty() riskGrowthRate!: number;
  @ApiProperty() highRiskUsersCount!: number;
}
