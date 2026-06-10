"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  UsersQueryParams,
  CreateUserData,
  UpdateUserData,
  AssignRoleData,
  LifecycleActionData,
  AuditQueryParams,
} from "../types";
import { notification } from "@/lib/notifications";

export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: () => usersApi.getList(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.permissions(userId),
    queryFn: () => usersApi.getPermissions(userId),
    enabled: !!userId,
  });
}

export function useUserSecurityProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.securityProfile(userId),
    queryFn: () => usersApi.getSecurityProfile(userId),
    enabled: !!userId,
  });
}

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.roles(userId),
    queryFn: () => usersApi.getRoles(userId),
    enabled: !!userId,
  });
}

export function useUserAuditLogs(userId: string, params?: Omit<AuditQueryParams, "userId">) {
  return useQuery({
    queryKey: [queryKeys.users.detail(userId), "audit", params],
    queryFn: () => usersApi.getAuditLogs({ ...params, userId }),
    enabled: !!userId,
  });
}

export function useUserRiskProfile(userId: string) {
  return useQuery({
    queryKey: [queryKeys.users.detail(userId), "risk"],
    queryFn: () => usersApi.getUserRisk(userId),
    enabled: !!userId,
  });
}

export function useUserSecurityTimeline(userId: string) {
  return useQuery({
    queryKey: [queryKeys.users.detail(userId), "security-timeline"],
    queryFn: () => usersApi.getUserSecurityTimeline(userId),
    enabled: !!userId,
  });
}

export function useUserAlerts(userId: string) {
  return useQuery({
    queryKey: [queryKeys.users.detail(userId), "alerts"],
    queryFn: () => {
      // Alerts don't have a direct userId filter, but metadata may contain it.
      // We fetch recent alerts and the backend filtering handles it.
      return usersApi.getAlerts({ limit: 20, sortDirection: "desc" });
    },
    enabled: !!userId,
  });
}

// CRUD Mutations

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      notification.success("User created successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to create user");
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserData) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User updated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to update user");
    },
  });
}

// Lifecycle Mutations

export function useSuspendUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LifecycleActionData) => usersApi.suspend(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User suspended successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to suspend user");
    },
  });
}

export function useActivateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User activated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to activate user");
    },
  });
}

export function useDisableUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LifecycleActionData) => usersApi.disable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User disabled successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to disable user");
    },
  });
}

export function useArchiveUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LifecycleActionData) => usersApi.archive(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User archived successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to archive user");
    },
  });
}

// Security Mutations

export function useForceLogout(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.forceLogout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.securityProfile(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      notification.success("All sessions revoked");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to force logout");
    },
  });
}

export function useRevokeSessions(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.revokeSessions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.securityProfile(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      notification.success("All sessions revoked");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to revoke sessions");
    },
  });
}

export function useAdminResetPassword(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => usersApi.adminResetPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      notification.success("Password reset successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to reset password");
    },
  });
}

export function useAdminDisable2FA(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.adminDisable2FA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.securityProfile(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      notification.success("2FA disabled by admin");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to disable 2FA");
    },
  });
}

// RBAC Mutations

export function useAssignRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignRoleData) => usersApi.assignRole(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.permissions(userId) });
      notification.success("Role assigned successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to assign role");
    },
  });
}

export function useRemoveRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => usersApi.removeRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.permissions(userId) });
      notification.success("Role removed successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to remove role");
    },
  });
}
