import { apiClient } from "@/lib/api/api-client";
import type { User } from "@/types/auth";
import type { UserPermissions } from "@/types/permissions";

export const userApi = {
  getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/users/me");
  },

  getUserPermissions(userId: string): Promise<UserPermissions> {
    return apiClient.get<UserPermissions>(`/users/${userId}/permissions`);
  },
};
