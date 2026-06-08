import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SettingDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: "PLATFORM" }) category!: string;
  @ApiProperty({ example: "platform_name" }) key!: string;
  @ApiProperty({ example: "Solvia" }) value!: string;
  @ApiProperty({ example: "STRING" }) valueType!: string;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty() isPublic!: boolean;
  @ApiProperty() isEditable!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PublicSettingDto {
  @ApiProperty() key!: string;
  @ApiProperty() value!: string;
  @ApiProperty() valueType!: string;
}

export class BulkUpdateResultDto {
  @ApiProperty() updated!: number;
  @ApiProperty({ type: [SettingDto] }) settings!: SettingDto[];
}
