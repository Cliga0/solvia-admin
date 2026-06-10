import { apiClient } from "@/lib/api/api-client";
import type {
  User,
  UserWithRoles,
  UsersListResponse,
  UsersQueryParams,
  CreateUserData,
  UpdateUserData,
  AssignRoleData,
  UsersDashboard,
} from "../types";

export const usersApi = {
  getDashboard(): Promise<UsersDashboard> {
    return apiClient.get<UsersDashboard>("/users/dashboard");
  },

  getList(params?: UsersQueryParams): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.search) queryParams.set("search", params.search);
    if (params?.status) queryParams.set("status", params.status);
    if (params?.role) queryParams.set("role", params.role);
    if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.set("sortOrder", params.sortOrder);

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
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  },

  activate(id: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/activate`, {});
  },

  deactivate(id: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/deactivate`, {});
  },

  suspend(id: string, reason: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/suspend`, { reason });
  },

  unsuspend(id: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/unsuspend`, {});
  },

  getRoles(userId: string): Promise<AssignRoleData[]> {
    return apiClient.get<AssignRoleData[]>(`/users/${userId}/roles`);
  },

  assignRole(userId: string, data: AssignRoleData): Promise<void> {
    return apiClient.post<void>(`/users/${userId}/roles`, data);
  },

  removeRole(userId: string, roleId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}/roles/${roleId}`);
  },

  getPermissions(userId: string): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`/users/${userId}/permissions`);
  },

  getSecurityProfile(userId: string): Promise<unknown> {
    return apiClient.get<unknown>(`/users/${userId}/security`);
  },

  getActivity(userId: string, params?: { limit?: number }): Promise<unknown[]> {
    const queryParams = params?.limit ? `?limit=${params.limit}` : "";
    return apiClient.get<unknown[]>(`/users/${userId}/activity${queryParams}`);
  },

  bulkActivate(ids: string[]): Promise<{ success: number; failed: number }> {
    return apiClient.post<{ success: number; failed: number }>("/users/bulk/activate", { ids });
  },

  bulkDeactivate(ids: string[]): Promise<{ success: number; failed: number }> {
    return apiClient.post<{ success: number; failed: number }>("/users/bulk/deactivate", { ids });
  },

  bulkSuspend(ids: string[], reason: string): Promise<{ success: number; failed: number }> {
    return apiClient.post<{ success: number; failed: number }>("/users/bulk/suspend", { ids, reason });
  },

  bulkDelete(ids: string[]): Promise<{ success: number; failed: number }> {
    return apiClient.post<{ success: number; failed: number }>("/users/bulk/delete", { ids });
  },
};
