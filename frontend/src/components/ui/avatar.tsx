"use client";

import * as React from "react";
import { Avatar } from "@base-ui/react/avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function AvatarComponent({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const initials = fallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar.Root className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}>
      {src && (
        <Avatar.Image
          src={src}
          alt={alt || fallback}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground">
        {initials}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

export { AvatarComponent as Avatar };
