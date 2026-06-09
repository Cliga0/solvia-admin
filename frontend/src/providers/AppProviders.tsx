"use client";

import { QueryProvider } from "@/providers/QueryProvider";
import { LiveAnnouncerProvider } from "@/components/accessibility";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LiveAnnouncerProvider>{children}</LiveAnnouncerProvider>
    </QueryProvider>
  );
}
