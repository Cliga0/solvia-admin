import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserStatus } from "../types";

export class UserQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    enum: Object.values(UserStatus),
    example: "ACTIVE",
  })
  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: string;

  @ApiPropertyOptional({ example: "SECURITY_MANAGER" })
  @IsOptional()
  @IsString()
  roleCode?: string;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00Z" })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59Z" })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortDirection?: "asc" | "desc" = "desc";
}
