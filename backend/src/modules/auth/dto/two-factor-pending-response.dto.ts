import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorPendingResponseDto {
  @ApiProperty()
  pendingToken!: string;

  @ApiProperty()
  twoFactorRequired!: true;
}
