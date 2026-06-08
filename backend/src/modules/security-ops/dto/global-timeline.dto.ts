import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class GlobalTimelineQueryDto {
  @IsOptional() @IsDateString() @ApiPropertyOptional() from?: string;
  @IsOptional() @IsDateString() @ApiPropertyOptional() to?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() module?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() userId?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() event?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) @ApiPropertyOptional({ default: 50 }) limit?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @ApiPropertyOptional({ default: 0 }) offset?: number;
}

export class GlobalTimelineEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() event!: string;
  @ApiProperty() module!: string;
  @ApiPropertyOptional() userId?: string | null;
  @ApiPropertyOptional() userEmail?: string | null;
  @ApiPropertyOptional() resourceType?: string | null;
  @ApiPropertyOptional() resourceId?: string | null;
  @ApiPropertyOptional() ip?: string | null;
  @ApiPropertyOptional() metadata?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
}

export class GlobalTimelineResponseDto {
  @ApiProperty({ type: [GlobalTimelineEntryDto] }) data!: GlobalTimelineEntryDto[];
  @ApiProperty() total!: number;
  @ApiProperty() hasMore!: boolean;
}
