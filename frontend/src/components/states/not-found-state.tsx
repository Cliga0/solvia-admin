"use client";

import { cn } from "@/lib/utils";
import { SearchX, Hop as Home } from "lucide-react";
import Link from "next/link";

interface NotFoundStateProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  className?: string;
}

export function NotFoundState({
  title = "Page not found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
  className,
}: NotFoundStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {showHomeButton && (
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-[min(var(--radius-md),12px)] h-7 px-2.5 text-[0.8rem] font-medium border border-border bg-background hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          Go to Dashboard
        </Link>
      )}
    </div>
  );
}
