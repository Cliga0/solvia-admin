export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED" | "PENDING" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  status: UserStatus;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorEnabledAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRoles extends User {
  roles: UserRole[];
}

export interface UserRole {
  id: string;
  name: string;
  code: string;
  assignedAt: string;
}

export interface UserPermission {
  code: string;
}

export interface UserSession {
  id: string;
  ip: string | null;
  userAgent: string | null;
  loginAt: string;
  logoutAt: string | null;
  lastActiveAt: string;
  isRevoked: boolean;
}

export interface UserSecurityProfile {
  twoFactorEnabled: boolean;
  twoFactorEnabledAt: string | null;
  lastLoginAt: string | null;
  activeSessions: UserSession[];
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsersListResponse {
  data: User[];
  pagination: UsersPagination;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  email?: string;
  status?: UserStatus;
  roleCode?: string;
  createdFrom?: string;
  createdTo?: string;
  sortDirection?: "asc" | "desc";
}

export interface CreateUserData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  email?: string;
}

export interface AssignRoleData {
  roleId: string;
}

export interface LifecycleActionData {
  reason?: string;
}

// Audit types (from GET /audit)
export interface AuditLogEntry {
  id: string;
  userId: string | null;
  event: string;
  module: string;
  resourceType: string | null;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  event?: string;
  module?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: "asc" | "desc";
}

export interface AuditSearchResponse {
  data: AuditLogEntry[];
  pagination: UsersPagination;
}

// Risk types (from GET /security/users/:id/risk)
export interface UserRiskProfile {
  userId: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastCalculatedAt: string;
  breakdown: {
    failedLogins: number;
    twoFactorFailures: number;
    passwordResets: number;
    roleChanges: number;
    accountDisabled: number;
    securityIncidents: number;
  };
}

// Security timeline (from GET /security/users/:id/timeline)
export interface SecurityTimelineEntry {
  id: string;
  event: string;
  module: string;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SecurityTimeline {
  userId: string;
  events: SecurityTimelineEntry[];
}

// Alert types (from GET /security/alerts)
export interface SecurityAlert {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string | null;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
  metadata: Record<string, unknown> | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolvedByUserId: string | null;
  resolvedByEmail: string | null;
  resolutionReason: string | null;
  resolutionNotes: string | null;
}

export interface AlertQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: "asc" | "desc";
}

export interface AlertSearchResponse {
  data: SecurityAlert[];
  pagination: UsersPagination;
}

// Risk History (from GET /security/risk/:userId/history)
export interface RiskHistoryEntry {
  id: string;
  userId: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  breakdown: Record<string, unknown> | null;
  createdAt: string;
}

export interface RiskTrend {
  date: string;
  avgScore: number;
  maxScore: number;
  minScore: number;
}

export interface RiskHistoryResponse {
  history: RiskHistoryEntry[];
  trend: RiskTrend[];
  total: number;
}

// Alert update (from PATCH /security/alerts/:id)
export interface UpdateAlertData {
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
  description?: string;
  resolutionReason?: string;
  resolutionNotes?: string;
}
