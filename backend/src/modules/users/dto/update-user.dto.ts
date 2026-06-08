import { IsEmail, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "newemail@solvia.com" })
  @IsOptional()
  @IsEmail()
  email?: string;
}
