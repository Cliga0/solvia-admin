import { create } from "zustand";
import type { Role, UserPermissions } from "@/types/permissions";

interface PermissionState {
  permissions: string[];
  roles: Role[];
  isLoaded: boolean;

  // Actions
  setPermissions: (permissions: UserPermissions) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleCode: string) => boolean;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  roles: [],
  isLoaded: false,

  setPermissions: (userPermissions: UserPermissions) => {
    set({
      permissions: userPermissions.permissions,
      roles: userPermissions.roles,
      isLoaded: true,
    });
  },

  hasPermission: (permission: string): boolean => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  hasAnyPermission: (checkPermissions: string[]): boolean => {
    const { permissions } = get();
    return checkPermissions.some((p) => permissions.includes(p));
  },

  hasAllPermissions: (checkPermissions: string[]): boolean => {
    const { permissions } = get();
    return checkPermissions.every((p) => permissions.includes(p));
  },

  hasRole: (roleCode: string): boolean => {
    const { roles } = get();
    return roles.some((r) => r.code === roleCode);
  },

  clearPermissions: () => {
    set({
      permissions: [],
      roles: [],
      isLoaded: false,
    });
  },
}));
