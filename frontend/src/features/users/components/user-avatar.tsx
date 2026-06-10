"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  email: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  email,
  src,
  size = "md",
  className,
}: UserAvatarProps) {
  const fallback = email.split("@")[0];

  return (
    <Avatar
      src={src}
      alt={email}
      fallback={fallback}
      size={size}
      className={cn(className)}
    />
  );
}

interface UserNameCellProps {
  email: string;
  avatarUrl?: string;
  className?: string;
}

export function UserNameCell({
  email,
  avatarUrl,
  className,
}: UserNameCellProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <UserAvatar
        email={email}
        src={avatarUrl}
        size="sm"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {email.split("@")[0]}
        </p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
