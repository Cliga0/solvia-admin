export interface PlatformHealth {
  systemStatus: string;
  maintenanceMode: boolean;
  activeInternalUsers: number;
  activeSessions: number;
  totalRoles: number;
  totalPermissions: number;
}

export interface SecurityOverview {
  failedLoginsToday: number;
  twoFactorEnabledUsers: number;
  twoFactorAdoptionRate: number;
  suspendedUsers: number;
  disabledUsers: number;
  recentSecurityEvents: {
    event: string;
    createdAt: string;
    userId: string | null;
  }[];
}

export interface UserOverview {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  disabledUsers: number;
  archivedUsers: number;
  recentUsers: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
  }[];
}

export interface AuditOverview {
  totalLogs: number;
  logsToday: number;
  logsLast7Days: number;
  recentAuditEvents: {
    id: string;
    event: string;
    module: string;
    userId: string | null;
    createdAt: string;
  }[];
}

export interface ConfigurationOverview {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  notificationsEnabled: boolean;
  securityProfile: {
    passwordMinLength: number;
    maxLoginAttempts: number;
    sessionTimeout: number;
  };
}

export interface QuickAction {
  label: string;
  path: string;
  permission: string;
}

export interface DashboardData {
  platform: PlatformHealth;
  security: SecurityOverview;
  users: UserOverview;
  audit: AuditOverview;
  settings: ConfigurationOverview;
  quickActions: QuickAction[];
}
