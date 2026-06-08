import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAlertDto {
  @ApiProperty({ enum: ["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"])
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
