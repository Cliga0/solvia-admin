import { IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class LifecycleActionDto {
  @ApiPropertyOptional({ example: "Policy violation" })
  @IsOptional()
  @IsString()
  reason?: string;
}
