import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateIncidentDto {
  @ApiProperty({ enum: ["OPEN", "INVESTIGATING", "RESOLVED"] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["OPEN", "INVESTIGATING", "RESOLVED"])
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
