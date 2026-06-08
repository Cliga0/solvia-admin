import { IsString, IsNotEmpty, MinLength, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DisableTwoFactorDto {
  @ApiProperty({ example: "P@ssw0rd123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
