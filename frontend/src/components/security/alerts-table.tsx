"use client";

import type { SecurityAlert, AlertSeverity } from "@/types/security";
import { SEVERITY_COLORS, ALERT_STATUS_COLORS } from "@/types/security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useUpdateAlert } from "@/hooks/use-security";
import { toast } from "sonner";

interface Props {
  alerts: SecurityAlert[];
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function AlertsTable({ alerts }: Props) {
  const updateAlertMutation = useUpdateAlert();

  const sortedAlerts = [...alerts].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  const handleStatusChange = (alertId: string, newStatus: string) => {
    updateAlertMutation.mutate(
      { id: alertId, data: { status: newStatus } },
      {
        onSuccess: () => toast.success("Alert status updated"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="size-4 text-primary-600" />
            Security Alerts
          </CardTitle>
          <Badge variant="secondary">{alerts.length} alerts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sortedAlerts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No security alerts
          </p>
        )}
        <div className="space-y-2">
          {sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${SEVERITY_COLORS[alert.severity]}`}
                >
                  {alert.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{alert.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatTime(alert.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ALERT_STATUS_COLORS[alert.status]}`}
                >
                  {alert.status.replace("_", " ")}
                </span>
                {alert.status !== "RESOLVED" && alert.status !== "FALSE_POSITIVE" && (
                  <Select
                    value={alert.status}
                    onValueChange={(val) => { if (val) handleStatusChange(alert.id, val); }}
                  >
                    <SelectTrigger size="sm" className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(dateStr: string): string {
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
