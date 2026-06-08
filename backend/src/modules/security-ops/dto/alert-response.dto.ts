import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AlertDto {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() severity!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() metadata?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
  @ApiPropertyOptional() resolvedAt?: Date | null;
  @ApiPropertyOptional() resolvedBy?: string | null;
}

export class AlertPaginationDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() pages!: number;
}

export class AlertSearchResponseDto {
  @ApiProperty({ type: [AlertDto] }) data!: AlertDto[];
  @ApiProperty() pagination!: AlertPaginationDto;
}
