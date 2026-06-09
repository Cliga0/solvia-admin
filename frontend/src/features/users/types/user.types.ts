export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: UserStatus;
  isActive: boolean;
  twoFactorEnabled: boolean;
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
  id: string;
  code: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  source: "ROLE" | "DIRECT";
  sourceName: string;
}

export interface UserSecurityProfile {
  twoFactorEnabled: boolean;
  twoFactorSetupAt: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  failedLoginAttempts: number;
  accountLockedUntil: string | null;
  passwordChangedAt: string | null;
}

export interface UserActivity {
  id: string;
  action: string;
  module: string;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
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
  search?: string;
  status?: UserStatus;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  status: UserStatus;
  roleIds: string[];
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  status?: UserStatus;
}

export interface AssignRoleData {
  roleId: string;
}

export interface UsersDashboard {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  recentUsers: number;
  usersByStatus: Record<UserStatus, number>;
  usersByRole: Record<string, number>;
}
