"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED" | "PENDING" | "ARCHIVED";
export type SettingStatus = "ENABLED" | "DISABLED" | "PENDING";

const userStatusVariants: Record<UserStatus, string> = {
  ACTIVE: "bg-success-100 text-success-800 hover:bg-success-100",
  SUSPENDED: "bg-error-100 text-error-800 hover:bg-error-100",
  DISABLED: "bg-muted text-muted-foreground hover:bg-muted",
  PENDING: "bg-warning-100 text-warning-800 hover:bg-warning-100",
  ARCHIVED: "bg-muted text-muted-foreground hover:bg-muted",
};

const settingStatusVariants: Record<SettingStatus, string> = {
  ENABLED: "bg-success-100 text-success-800 hover:bg-success-100",
  DISABLED: "bg-muted text-muted-foreground hover:bg-muted",
  PENDING: "bg-warning-100 text-warning-800 hover:bg-warning-100",
};

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium border-0", userStatusVariants[status], className)}
    >
      {status}
    </Badge>
  );
}

interface SettingStatusBadgeProps {
  status: SettingStatus;
  children?: React.ReactNode;
  className?: string;
}

export function SettingStatusBadge({ status, children, className }: SettingStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium border-0", settingStatusVariants[status], className)}
    >
      {children ?? status}
    </Badge>
  );
}

interface BooleanStatusBadgeProps {
  enabled: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
  className?: string;
}

export function BooleanStatusBadge({
  enabled,
  enabledLabel = "Enabled",
  disabledLabel = "Disabled",
  className,
}: BooleanStatusBadgeProps) {
  const status = enabled ? "ENABLED" : "DISABLED";
  return (
    <SettingStatusBadge status={status} className={className}>
      {enabled ? enabledLabel : disabledLabel}
    </SettingStatusBadge>
  );
}
