import { SetMetadata } from "@nestjs/common";
import {
  PERMISSION_METADATA_KEY,
  PERMISSION_MODE_KEY,
} from "./permission-metadata";
import { PermissionMode } from "./permission-mode";

export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_METADATA_KEY, [permission]) &&
  SetMetadata(PERMISSION_MODE_KEY, PermissionMode.SINGLE);

export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_METADATA_KEY, permissions) &&
  SetMetadata(PERMISSION_MODE_KEY, PermissionMode.ANY);

export const RequireAllPermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSION_METADATA_KEY, permissions) &&
  SetMetadata(PERMISSION_MODE_KEY, PermissionMode.ALL);
