"use client";

import type { SecurityDashboardData } from "@/types/security";
import { ENGINE_STATUS_COLORS } from "@/types/security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TriangleAlert as AlertTriangle, FileText, Users, Activity, Clock } from "lucide-react";

interface Props {
  data: SecurityDashboardData;
}

export function SecurityOverviewCard({ data }: Props) {
  const metrics = data.engineMetrics;

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

        <div className="rounded-md bg-muted/50 p-2 space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Activity className="size-3" /> Engine Status
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ENGINE_STATUS_COLORS[metrics.detectionEngineStatus]}`}
                >
                  {metrics.detectionEngineStatus}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Detection</p>
              {metrics.lastDetectionRun && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="size-2.5" /> {formatTime(metrics.lastDetectionRun)}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ENGINE_STATUS_COLORS[metrics.riskEngineStatus]}`}
                >
                  {metrics.riskEngineStatus}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Risk Engine</p>
              {metrics.lastRiskCalculationRun && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="size-2.5" /> {formatTime(metrics.lastRiskCalculationRun)}
                </p>
              )}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {metrics.alertsCreatedToday} alerts created by engines today
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

        <div className="rounded-md bg-muted/50 p-2 space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Activity className="size-3" /> Analytics
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-lg font-semibold leading-none">{data.alertsLast24Hours}</p>
              <p className="text-xs text-muted-foreground">Alerts (24h)</p>
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">{data.alertsLast7Days}</p>
              <p className="text-xs text-muted-foreground">Alerts (7d)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DistributionBars data={data.alertsBySeverity} label="By Severity" />
            <DistributionBars data={data.riskDistribution} label="Risk Levels" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DistributionBars data={data.alertsByType} label="By Type" />
            <DistributionBars data={data.incidentsByStatus} label="Incidents" />
          </div>
        </div>
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

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "never";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return "";
  }
}

function DistributionBars({
  data,
  label,
}: {
  data: Record<string, number>;
  label: string;
}) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <div className="space-y-0.5">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground w-14 truncate" title={key}>
              {key.replace(/_/g, " ")}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-400 rounded-full"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums">{value}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-[10px] text-muted-foreground">No data</p>
        )}
      </div>
    </div>
  );
}
