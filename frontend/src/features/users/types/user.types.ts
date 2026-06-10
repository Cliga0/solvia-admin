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
