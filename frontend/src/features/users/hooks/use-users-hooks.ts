"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  UsersQueryParams,
  CreateUserData,
  UpdateUserData,
  AssignRoleData,
} from "../types";
import { notification } from "@/lib/notifications";

export function useUsersDashboard() {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: () => usersApi.getDashboard(),
  });
}

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

export function useUserActivity(userId: string, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), "activity", { limit }],
    queryFn: () => usersApi.getActivity(userId, { limit }),
    enabled: !!userId,
  });
}

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

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      notification.success("User deleted successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to delete user");
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

export function useDeactivateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User deactivated successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to deactivate user");
    },
  });
}

export function useSuspendUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => usersApi.suspend(id, reason),
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

export function useUnsuspendUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.unsuspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      notification.success("User unsuspended successfully");
    },
    onError: (error: Error) => {
      notification.error(error.message || "Failed to unsuspend user");
    },
  });
}

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
