import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RiskHistoryEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() riskScore!: number;
  @ApiProperty() riskLevel!: string;
  @ApiPropertyOptional() breakdown?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
}

export class RiskTrendDto {
  @ApiProperty() date!: string;
  @ApiProperty() avgScore!: number;
  @ApiProperty() maxScore!: number;
  @ApiProperty() minScore!: number;
}

export class RiskHistoryResponseDto {
  @ApiProperty({ type: [RiskHistoryEntryDto] }) history!: RiskHistoryEntryDto[];
  @ApiProperty({ type: [RiskTrendDto] }) trend!: RiskTrendDto[];
  @ApiProperty() total!: number;
}
