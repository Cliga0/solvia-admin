"use client";

import type { PlatformHealth } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Key, Shield } from "lucide-react";

interface Props {
  data: PlatformHealth;
}

export function PlatformHealthCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4 text-primary-600" />
            Platform Health
          </CardTitle>
          <Badge
            variant={data.systemStatus === "healthy" ? "default" : "destructive"}
          >
            {data.systemStatus === "healthy" ? "Healthy" : "Maintenance"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={<Users className="size-3.5" />} label="Active Users" value={data.activeInternalUsers} />
          <Metric icon={<Activity className="size-3.5" />} label="Active Sessions" value={data.activeSessions} />
          <Metric icon={<Key className="size-3.5" />} label="Roles" value={data.totalRoles} />
          <Metric icon={<Shield className="size-3.5" />} label="Permissions" value={data.totalPermissions} />
        </div>
        {data.maintenanceMode && (
          <div className="rounded-md bg-warning-50 border border-warning-200 p-2 text-xs text-warning-800">
            Maintenance mode is active
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
