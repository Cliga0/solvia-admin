import { ApiProperty } from "@nestjs/swagger";

export class UserRiskProfileDto {
  @ApiProperty() userId!: string;
  @ApiProperty() riskScore!: number;
  @ApiProperty() riskLevel!: string;
  @ApiProperty() lastCalculatedAt!: Date;
}
