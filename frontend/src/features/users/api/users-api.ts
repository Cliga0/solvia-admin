import { apiClient } from "@/lib/api/api-client";
import type {
  User,
  UserWithRoles,
  UsersListResponse,
  UsersQueryParams,
  CreateUserData,
  UpdateUserData,
  AssignRoleData,
  LifecycleActionData,
  UserSecurityProfile,
} from "../types";

export const usersApi = {
  getList(params?: UsersQueryParams): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.email) queryParams.set("email", params.email);
    if (params?.status) queryParams.set("status", params.status);
    if (params?.roleCode) queryParams.set("roleCode", params.roleCode);
    if (params?.createdFrom) queryParams.set("createdFrom", params.createdFrom);
    if (params?.createdTo) queryParams.set("createdTo", params.createdTo);
    if (params?.sortDirection) queryParams.set("sortDirection", params.sortDirection);

    const queryString = queryParams.toString();
    return apiClient.get<UsersListResponse>(`/users${queryString ? `?${queryString}` : ""}`);
  },

  getById(id: string): Promise<UserWithRoles> {
    return apiClient.get<UserWithRoles>(`/users/${id}`);
  },

  create(data: CreateUserData): Promise<User> {
    return apiClient.post<User>("/users", data);
  },

  update(id: string, data: UpdateUserData): Promise<User> {
    return apiClient.post<User>(`/users/${id}`, data);
  },

  // Lifecycle
  suspend(id: string, data: LifecycleActionData): Promise<User> {
    return apiClient.post<User>(`/users/${id}/suspend`, data);
  },

  activate(id: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/activate`, {});
  },

  disable(id: string, data: LifecycleActionData): Promise<User> {
    return apiClient.post<User>(`/users/${id}/disable`, data);
  },

  archive(id: string, data: LifecycleActionData): Promise<User> {
    return apiClient.post<User>(`/users/${id}/archive`, data);
  },

  // Security Control
  forceLogout(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/force-logout`, {});
  },

  revokeSessions(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/revoke-sessions`, {});
  },

  adminResetPassword(id: string, password: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/reset-password`, { password });
  },

  adminDisable2FA(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${id}/disable-2fa`, {});
  },

  // RBAC
  getRoles(userId: string): Promise<UserWithRoles["roles"]> {
    return apiClient.get<UserWithRoles["roles"]>(`/users/${userId}/roles`);
  },

  assignRole(userId: string, data: AssignRoleData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${userId}/roles`, data);
  },

  removeRole(userId: string, roleId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${userId}/roles/${roleId}`);
  },

  getPermissions(userId: string): Promise<string[]> {
    return apiClient.get<string[]>(`/users/${userId}/permissions`);
  },

  // Security Profile
  getSecurityProfile(userId: string): Promise<UserSecurityProfile> {
    return apiClient.get<UserSecurityProfile>(`/users/${userId}/security-profile`);
  },
};
