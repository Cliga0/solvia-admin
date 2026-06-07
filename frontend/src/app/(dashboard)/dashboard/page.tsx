"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { PlatformHealthCard } from "@/components/dashboard/platform-health-card";
import { SecurityOverviewCard } from "@/components/dashboard/security-overview-card";
import { UserOverviewCard } from "@/components/dashboard/user-overview-card";
import { AuditActivityCard } from "@/components/dashboard/audit-activity-card";
import { ConfigurationCard } from "@/components/dashboard/configuration-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 p-6">
        <p className="text-sm text-destructive">
          Failed to load dashboard data.
        </p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Operational overview of the Solvia ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlatformHealthCard data={data.platform} />
        <SecurityOverviewCard data={data.security} />
        <UserOverviewCard data={data.users} />
        <AuditActivityCard data={data.audit} />
        <ConfigurationCard data={data.settings} />
        <QuickActionsCard actions={data.quickActions} />
      </div>
    </div>
  );
}
