import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RuleHistoryEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() ruleId!: string;
  @ApiPropertyOptional() previousConfiguration?: Record<string, unknown> | null;
  @ApiPropertyOptional() newConfiguration?: Record<string, unknown> | null;
  @ApiPropertyOptional() changedBy?: string | null;
  @ApiProperty() createdAt!: Date;
}

export class RuleHistoryResponseDto {
  @ApiProperty({ type: [RuleHistoryEntryDto] }) history!: RuleHistoryEntryDto[];
  @ApiProperty() total!: number;
}
