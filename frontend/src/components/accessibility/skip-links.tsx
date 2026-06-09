"use client";

import { cn } from "@/lib/utils";

export function SkipLink({ href = "#main-content", label = "Skip to main content" }: { href?: string; label?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50",
        "focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-ring"
      )}
    >
      {label}
    </a>
  );
}

export function SkipLinks() {
  return (
    <>
      <SkipLink href="#main-content" label="Skip to main content" />
      <SkipLink href="#sidebar-navigation" label="Skip to navigation" />
    </>
  );
}
