import { ApiProperty } from "@nestjs/swagger";

export class RiskBreakdownDto {
  @ApiProperty() failedLogins!: number;
  @ApiProperty() twoFactorFailures!: number;
  @ApiProperty() passwordResets!: number;
  @ApiProperty() roleChanges!: number;
  @ApiProperty() accountDisabled!: number;
  @ApiProperty() securityIncidents!: number;
}

export class UserRiskProfileWithBreakdownDto {
  @ApiProperty() userId!: string;
  @ApiProperty() riskScore!: number;
  @ApiProperty() riskLevel!: string;
  @ApiProperty() lastCalculatedAt!: Date;
  @ApiProperty() breakdown!: RiskBreakdownDto;
}
