"use client";

import { usePermissionStore } from "@/stores/permission.store";

export function usePermissions() {
  const { permissions, roles, isLoaded, hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissionStore();

  const can = (permission: string): boolean => {
    if (!isLoaded) return false;
    return hasPermission(permission);
  };

  const canAny = (permissionList: string[]): boolean => {
    if (!isLoaded) return false;
    return hasAnyPermission(permissionList);
  };

  const canAll = (permissionList: string[]): boolean => {
    if (!isLoaded) return false;
    return hasAllPermissions(permissionList);
  };

  const isRole = (roleCode: string): boolean => {
    if (!isLoaded) return false;
    return hasRole(roleCode);
  };

  const isSuperAdmin = (): boolean => {
    return isRole("SUPER_ADMIN");
  };

  return {
    permissions,
    roles,
    isLoaded,
    can,
    canAny,
    canAll,
    isRole,
    isSuperAdmin,
  };
}
