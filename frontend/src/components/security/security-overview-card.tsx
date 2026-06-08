"use client";

import type { SecurityDashboardData } from "@/types/security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, FileText, Users } from "lucide-react";

interface Props {
  data: SecurityDashboardData;
}

export function SecurityOverviewCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="size-4 text-primary-600" />
          Security Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Metric
            icon={<AlertTriangle className="size-3.5" />}
            label="Open Alerts"
            value={data.openAlerts}
            color={data.criticalAlerts > 0 ? "text-error-700" : "text-foreground"}
          />
          <Metric
            icon={<AlertTriangle className="size-3.5" />}
            label="Critical Alerts"
            value={data.criticalAlerts}
            color={data.criticalAlerts > 0 ? "text-error-700" : "text-foreground"}
          />
          <Metric
            icon={<FileText className="size-3.5" />}
            label="Active Incidents"
            value={data.activeIncidents}
            color={data.activeIncidents > 0 ? "text-warning-700" : "text-foreground"}
          />
          <Metric
            icon={<Users className="size-3.5" />}
            label="High Risk Users"
            value={data.highRiskUsers}
            color={data.highRiskUsers > 0 ? "text-error-700" : "text-foreground"}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.failedLoginsToday}</p>
            <p className="text-xs text-muted-foreground">Failed Logins Today</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.securityEventsToday}</p>
            <p className="text-xs text-muted-foreground">Security Events Today</p>
          </div>
        </div>

        {data.recentAlerts.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-medium text-muted-foreground">Recent Alerts</p>
            {data.recentAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{alert.title}</span>
                <Badge variant="outline" className="text-[10px] shrink-0 px-1 py-0">
                  {alert.severity}
                </Badge>
              </div>
            ))}
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
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className={`text-lg font-semibold leading-none ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
