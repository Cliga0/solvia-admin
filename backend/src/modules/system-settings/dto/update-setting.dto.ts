import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSettingDto {
  @ApiProperty({ example: "Solvia" })
  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class BulkUpdateSettingItemDto {
  @ApiProperty({ example: "platform_name" })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: "Solvia" })
  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ type: [BulkUpdateSettingItemDto] })
  @IsNotEmpty()
  items!: BulkUpdateSettingItemDto[];
}

export class CategoryParamsDto {
  @ApiProperty({ example: "PLATFORM" })
  @IsString()
  @IsNotEmpty()
  category!: string;
}

export class KeyParamsDto {
  @ApiProperty({ example: "platform_name" })
  @IsString()
  @IsNotEmpty()
  key!: string;
}
