import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CorrelationAlertDto {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() severity!: string;
  @ApiProperty({ type: [String] }) sourceAlerts!: string[];
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: Date;
  @ApiPropertyOptional() resolvedAt?: Date | null;
}

export class CorrelationAlertSearchResponseDto {
  @ApiProperty({ type: [CorrelationAlertDto] }) data!: CorrelationAlertDto[];
  @ApiProperty() total!: number;
}
