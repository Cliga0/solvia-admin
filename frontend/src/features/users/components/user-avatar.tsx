"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  email: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  firstName,
  lastName,
  email,
  src,
  size = "md",
  className,
}: UserAvatarProps) {
  const fallback = `${firstName} ${lastName}`.trim() || email;

  return (
    <Avatar
      src={src}
      alt={`${firstName} ${lastName}`}
      fallback={fallback}
      size={size}
      className={cn(className)}
    />
  );
}

interface UserNameCellProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  className?: string;
}

export function UserNameCell({
  firstName,
  lastName,
  email,
  avatarUrl,
  className,
}: UserNameCellProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <UserAvatar
        firstName={firstName}
        lastName={lastName}
        email={email}
        src={avatarUrl}
        size="sm"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {firstName} {lastName}
        </p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
