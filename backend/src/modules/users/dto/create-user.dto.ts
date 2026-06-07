import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "admin@solvia.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "P@ssw0rd123" })
  @IsString()
  @MinLength(8)
  password!: string;
}
