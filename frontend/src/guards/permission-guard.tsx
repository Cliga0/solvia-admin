"use client";

import { usePermissions } from "@/features/auth";

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  mode?: "any" | "all";
  role?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  mode = "any",
  role,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll, isRole, isSuperAdmin, isLoaded } = usePermissions();

  if (!isLoaded) {
    return null;
  }

  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (role) {
    hasAccess = isRole(role);
  } else if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = mode === "all" ? canAll(permissions) : canAny(permissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
