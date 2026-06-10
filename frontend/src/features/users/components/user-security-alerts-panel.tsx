"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert as AlertCircle, Clock, Shield } from "lucide-react";
import type { SecurityAlert } from "../types";
import { EmptyState } from "@/components/states/empty-state";

interface UserSecurityAlertsPanelProps {
  alerts: SecurityAlert[];
  isLoading?: boolean;
  className?: string;
}

const severityStyles: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800 border-0",
  MEDIUM: "bg-warning-100 text-warning-800 border-0",
  HIGH: "bg-orange-100 text-orange-800 border-0",
  CRITICAL: "bg-error-100 text-error-800 border-0",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-error-100 text-error-800 border-0",
  INVESTIGATING: "bg-warning-100 text-warning-800 border-0",
  RESOLVED: "bg-success-100 text-success-800 border-0",
  FALSE_POSITIVE: "bg-muted text-muted-foreground border-0",
};

export function UserSecurityAlertsPanel({
  alerts,
  isLoading,
  className,
}: UserSecurityAlertsPanelProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Alerts
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {alerts.length} alerts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <EmptyState
            title="No security alerts"
            message="No security alerts found for this user."
          />
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between rounded-md border p-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <AlertCircle className={cn(
                    "h-4 w-4 mt-0.5 shrink-0",
                    alert.severity === "CRITICAL" || alert.severity === "HIGH"
                      ? "text-error-500"
                      : "text-warning-500"
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.type.replace(/_/g, " ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-[10px]", severityStyles[alert.severity] || "")}>
                        {alert.severity}
                      </Badge>
                      <Badge className={cn("text-[10px]", statusStyles[alert.status] || "")}>
                        {alert.status}
                      </Badge>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
