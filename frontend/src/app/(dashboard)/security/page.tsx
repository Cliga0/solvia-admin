"use client";

import { useState } from "react";
import { useSecurityDashboard, useSecurityAlerts, useSecurityIncidents } from "@/hooks/use-security";
import { SecurityOverviewCard } from "@/components/security/security-overview-card";
import { AlertsTable } from "@/components/security/alerts-table";
import { IncidentsCard } from "@/components/security/incidents-card";
import { RecentActivityCard } from "@/components/security/recent-activity-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TriangleAlert as AlertTriangle, FileText, Activity } from "lucide-react";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboard, isLoading: dashboardLoading, error: dashboardError } = useSecurityDashboard();
  const { data: alertsData, isLoading: alertsLoading } = useSecurityAlerts();
  const { data: incidentsData, isLoading: incidentsLoading } = useSecurityIncidents();

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 p-6">
        <p className="text-sm text-destructive">Failed to load security data.</p>
        <p className="text-xs text-muted-foreground">
          {dashboardError instanceof Error ? dashboardError.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const isLoading = dashboardLoading || alertsLoading || incidentsLoading;

  if (isLoading || !dashboard) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security Operations Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor, investigate, and manage security events across the platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-1.5">
            <Shield className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5">
            <AlertTriangle className="size-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-1.5">
            <FileText className="size-3.5" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <Activity className="size-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SecurityOverviewCard data={dashboard} />
            <AlertsTable alerts={(alertsData?.data ?? []).slice(0, 5)} />
            <IncidentsCard incidents={(incidentsData?.data ?? []).slice(0, 5)} />
            <RecentActivityCard data={dashboard} />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <AlertsTable alerts={alertsData?.data ?? []} />
        </TabsContent>

        <TabsContent value="incidents" className="mt-4">
          <IncidentsCard incidents={incidentsData?.data ?? []} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <RecentActivityCard data={dashboard} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
