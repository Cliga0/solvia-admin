import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsObject,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAuditLogDto {
  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: "USER_CREATED" })
  @IsString()
  @IsNotEmpty()
  event!: string;

  @ApiProperty({ example: "users" })
  @IsString()
  @IsNotEmpty()
  module!: string;

  @ApiPropertyOptional({ example: "internal_users" })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ example: "192.168.1.1" })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({ example: "Mozilla/5.0..." })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ example: { field: "isActive", from: true, to: false } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
