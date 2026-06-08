import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyTwoFactorLoginDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIs..." })
  @IsString()
  @IsNotEmpty()
  pendingToken!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
