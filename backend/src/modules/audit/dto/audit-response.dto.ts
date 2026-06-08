import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuditLogEntryDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() userId?: string | null;
  @ApiProperty() event!: string;
  @ApiProperty() module!: string;
  @ApiPropertyOptional() resourceType?: string | null;
  @ApiPropertyOptional() resourceId?: string | null;
  @ApiPropertyOptional() ip?: string | null;
  @ApiPropertyOptional() userAgent?: string | null;
  @ApiPropertyOptional() metadata?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
}

export class AuditPaginationDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() pages!: number;
}

export class AuditSearchResponseDto {
  @ApiProperty({ type: [AuditLogEntryDto] }) data!: AuditLogEntryDto[];
  @ApiProperty() pagination!: AuditPaginationDto;
}
