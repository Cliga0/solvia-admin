import { ApiProperty } from "@nestjs/swagger";

export class PlatformHealthDto {
  @ApiProperty({ example: "healthy" }) systemStatus!: string;
  @ApiProperty({ example: false }) maintenanceMode!: boolean;
  @ApiProperty({ example: 18 }) activeInternalUsers!: number;
  @ApiProperty({ example: 34 }) activeSessions!: number;
  @ApiProperty({ example: 7 }) totalRoles!: number;
  @ApiProperty({ example: 14 }) totalPermissions!: number;
}

export class SecurityOverviewDto {
  @ApiProperty({ example: 3 }) failedLoginsToday!: number;
  @ApiProperty({ example: 8 }) twoFactorEnabledUsers!: number;
  @ApiProperty({ example: 44.4 }) twoFactorAdoptionRate!: number;
  @ApiProperty({ example: 2 }) suspendedUsers!: number;
  @ApiProperty({ example: 1 }) disabledUsers!: number;
  @ApiProperty({ type: [Object] }) recentSecurityEvents!: {
    event: string;
    createdAt: Date;
    userId: string | null;
  }[];
}

export class UserOverviewDto {
  @ApiProperty({ example: 20 }) totalUsers!: number;
  @ApiProperty({ example: 18 }) activeUsers!: number;
  @ApiProperty({ example: 0 }) pendingUsers!: number;
  @ApiProperty({ example: 2 }) suspendedUsers!: number;
  @ApiProperty({ example: 1 }) disabledUsers!: number;
  @ApiProperty({ example: 0 }) archivedUsers!: number;
  @ApiProperty({ type: [Object] }) recentUsers!: {
    id: string;
    email: string;
    status: string;
    createdAt: Date;
  }[];
}

export class AuditOverviewDto {
  @ApiProperty({ example: 1250 }) totalLogs!: number;
  @ApiProperty({ example: 42 }) logsToday!: number;
  @ApiProperty({ example: 310 }) logsLast7Days!: number;
  @ApiProperty({ type: [Object] }) recentAuditEvents!: {
    id: string;
    event: string;
    module: string;
    userId: string | null;
    createdAt: Date;
  }[];
}

export class ConfigurationOverviewDto {
  @ApiProperty({ example: "Solvia" }) platformName!: string;
  @ApiProperty({ example: "support@solvia.com" }) supportEmail!: string;
  @ApiProperty({ example: false }) maintenanceMode!: boolean;
  @ApiProperty({ example: true }) notificationsEnabled!: boolean;
  @ApiProperty() securityProfile!: {
    passwordMinLength: number;
    maxLoginAttempts: number;
    sessionTimeout: number;
  };
}

export class QuickActionDto {
  @ApiProperty() label!: string;
  @ApiProperty() path!: string;
  @ApiProperty() permission!: string;
}

export class DashboardResponseDto {
  @ApiProperty() platform!: PlatformHealthDto;
  @ApiProperty() security!: SecurityOverviewDto;
  @ApiProperty() users!: UserOverviewDto;
  @ApiProperty() audit!: AuditOverviewDto;
  @ApiProperty() settings!: ConfigurationOverviewDto;
  @ApiProperty({ type: [QuickActionDto] }) quickActions!: QuickActionDto[];
}
