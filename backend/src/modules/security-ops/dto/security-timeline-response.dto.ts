import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TimelineEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() event!: string;
  @ApiProperty() module!: string;
  @ApiPropertyOptional() ip?: string | null;
  @ApiPropertyOptional() metadata?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
}

export class SecurityTimelineDto {
  @ApiProperty() userId!: string;
  @ApiProperty({ type: [TimelineEntryDto] }) events!: TimelineEntryDto[];
}
