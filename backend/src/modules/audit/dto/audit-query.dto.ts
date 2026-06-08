import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditEvents, AuditModules } from "@/config";

export class AuditQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;

  @ApiPropertyOptional({
    enum: Object.values(AuditEvents),
    example: "AUTH_LOGIN_SUCCESS",
  })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiPropertyOptional({
    enum: Object.values(AuditModules),
    example: "auth",
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: "internal_users" })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00Z" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59Z" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortDirection?: "asc" | "desc" = "desc";
}
