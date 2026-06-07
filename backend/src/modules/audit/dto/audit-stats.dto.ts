import { ApiProperty } from "@nestjs/swagger";

export class AuditStatsDto {
  @ApiProperty() totalLogs!: number;
  @ApiProperty() logsToday!: number;
  @ApiProperty() logsLast7Days!: number;
  @ApiProperty() logsLast30Days!: number;
  @ApiProperty() countByModule!: Record<string, number>;
  @ApiProperty() countByEvent!: Record<string, number>;
}
