"use client";

import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span className={cn("sr-only", className)}>
      {children}
    </span>
  );
}

export function HiddenWhenSmall({ children, className }: VisuallyHiddenProps) {
  return (
    <span className={cn("hidden @lg:block", className)}>
      {children}
    </span>
  );
}

export function VisibleWhenSmall({ children, className }: VisuallyHiddenProps) {
  return (
    <span className={cn("@lg:hidden", className)}>
      {children}
    </span>
  );
}
