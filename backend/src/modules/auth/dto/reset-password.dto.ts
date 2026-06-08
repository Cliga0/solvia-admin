import { IsString, IsNotEmpty, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: "a1b2c3d4..." })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: "NewP@ssw0rd123" })
  @IsString()
  @MinLength(8)
  password!: string;
}
