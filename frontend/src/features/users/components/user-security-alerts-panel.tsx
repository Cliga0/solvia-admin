"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert as AlertCircle, Clock, Shield, CircleCheck as CheckCircle2 } from "lucide-react";
import type { SecurityAlert } from "../types";
import { EmptyState } from "@/components/states/empty-state";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";
import { useUpdateAlert } from "../hooks";
import { AlertDetailDrawer } from "./alert-detail-drawer";

interface UserSecurityAlertsPanelProps {
  alerts: SecurityAlert[];
  isLoading?: boolean;
  userId: string;
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
  userId: _userId,
  className,
}: UserSecurityAlertsPanelProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    alertId: string;
    status: "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
    label: string;
    description: string;
  } | null>(null);

  const updateAlert = useUpdateAlert(confirmAction?.alertId ?? "");

  const handleAlertClick = (alertId: string) => {
    setSelectedAlertId(alertId);
    setDrawerOpen(true);
  };

  const handleQuickAction = (
    alertId: string,
    status: "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE",
    label: string,
    description: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setConfirmAction({ alertId, status, label, description });
  };

  const confirmQuickAction = () => {
    if (confirmAction) {
      updateAlert.mutate(
        { status: confirmAction.status },
        {
          onSuccess: () => setConfirmAction(null),
        },
      );
    }
  };

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
    <>
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
                  className="flex items-start justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAlertClick(alert.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleAlertClick(alert.id)}
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
                          {alert.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions for OPEN alerts */}
                  {alert.status === "OPEN" && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleQuickAction(alert.id, "INVESTIGATING", "Acknowledge", "Mark as investigating?", e)}
                        title="Acknowledge"
                      >
                        <Shield className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleQuickAction(alert.id, "RESOLVED", "Resolve", "Mark as resolved?", e)}
                        title="Resolve"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alertId={selectedAlertId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Quick Action Confirm */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        variant={confirmAction?.status === "FALSE_POSITIVE" ? "warning" : "default"}
        title={confirmAction?.label ?? ""}
        description={confirmAction?.description ?? ""}
        confirmLabel={confirmAction?.label ?? "Confirm"}
        onConfirm={confirmQuickAction}
        loading={updateAlert.isPending}
      />
    </>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
