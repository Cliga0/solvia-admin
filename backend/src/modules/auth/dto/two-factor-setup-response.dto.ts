import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorSetupResponseDto {
  @ApiProperty()
  otpauthUrl!: string;

  @ApiProperty()
  qrCodeDataUrl!: string;
}
