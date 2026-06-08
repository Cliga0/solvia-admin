import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class IncidentDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() alertId?: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() assignedTo?: string | null;
  @ApiPropertyOptional() assignedToUserId?: string | null;
  @ApiPropertyOptional() assignedToEmail?: string | null;
  @ApiPropertyOptional() notes?: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiPropertyOptional() resolvedAt?: Date | null;
}

export class IncidentPaginationDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() pages!: number;
}

export class IncidentSearchResponseDto {
  @ApiProperty({ type: [IncidentDto] }) data!: IncidentDto[];
  @ApiProperty() pagination!: IncidentPaginationDto;
}
