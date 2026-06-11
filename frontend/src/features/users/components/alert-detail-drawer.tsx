"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataRow, DataSection } from "@/components/design-system";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";
import { X, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Ban } from "lucide-react";
import { useAlertDetail, useUpdateAlert } from "../hooks";
import { useState } from "react";

interface AlertDetailDrawerProps {
  alertId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AlertDetailDrawer({ alertId, open, onOpenChange }: AlertDetailDrawerProps) {
  const { data: alert, isLoading } = useAlertDetail(alertId ?? "");
  const updateAlert = useUpdateAlert(alertId ?? "");
  const [confirmAction, setConfirmAction] = useState<{
    status: "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
    label: string;
    description: string;
  } | null>(null);

  const handleStatusUpdate = (status: "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE", label: string, description: string) => {
    setConfirmAction({ status, label, description });
  };

  const confirmStatusUpdate = () => {
    if (confirmAction) {
      updateAlert.mutate(
        { status: confirmAction.status },
        {
          onSuccess: () => setConfirmAction(null),
        },
      );
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-md">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-sm">Alert Details</DrawerTitle>
            <DrawerClose className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted">
              <X className="h-3 w-3" />
            </DrawerClose>
          </div>
          <DrawerDescription className="text-xs text-muted-foreground">
            Security alert information and actions
          </DrawerDescription>
        </DrawerHeader>

        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : alert ? (
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn(
                "h-5 w-5 mt-0.5 shrink-0",
                alert.severity === "CRITICAL" || alert.severity === "HIGH"
                  ? "text-error-500"
                  : "text-warning-500",
              )} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alert.type.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Status + Severity */}
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px]", severityStyles[alert.severity] || "")}>
                {alert.severity}
              </Badge>
              <Badge className={cn("text-[10px]", statusStyles[alert.status] || "")}>
                {alert.status.replace(/_/g, " ")}
              </Badge>
            </div>

            {/* Description */}
            {alert.description && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs">{alert.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <DataSection title="Information">
                  <DataRow label="Type" value={alert.type.replace(/_/g, " ")} />
                  <DataRow label="Severity" value={alert.severity} />
                  <DataRow label="Status" value={alert.status.replace(/_/g, " ")} />
                  <DataRow
                    label="Created"
                    value={new Date(alert.createdAt).toLocaleString()}
                  />
                  {alert.resolvedAt && (
                    <DataRow
                      label="Resolved"
                      value={new Date(alert.resolvedAt).toLocaleString()}
                    />
                  )}
                </DataSection>

                {(alert.resolvedByEmail || alert.resolutionReason) && (
                  <DataSection title="Resolution">
                    {alert.resolvedByEmail && (
                      <DataRow label="Resolved By" value={alert.resolvedByEmail} />
                    )}
                    {alert.resolutionReason && (
                      <DataRow label="Reason" value={alert.resolutionReason} />
                    )}
                    {alert.resolutionNotes && (
                      <DataRow label="Notes" value={alert.resolutionNotes} />
                    )}
                  </DataSection>
                )}

                {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                  <DataSection title="Metadata">
                    {Object.entries(alert.metadata).map(([key, value]) => (
                      <DataRow key={key} label={key} value={String(value)} />
                    ))}
                  </DataSection>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {alert.status === "OPEN" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleStatusUpdate("INVESTIGATING", "Acknowledge", "This will mark the alert as being investigated.")}
                      disabled={updateAlert.isPending}
                    >
                      <Shield className="h-3 w-3" />
                      Acknowledge
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleStatusUpdate("RESOLVED", "Resolve", "This will mark the alert as resolved.")}
                      disabled={updateAlert.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleStatusUpdate("FALSE_POSITIVE", "Mark False Positive", "This will mark the alert as a false positive.")}
                      disabled={updateAlert.isPending}
                    >
                      <Ban className="h-3 w-3" />
                      False Positive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {alert.status === "INVESTIGATING" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleStatusUpdate("RESOLVED", "Resolve", "This will mark the alert as resolved.")}
                      disabled={updateAlert.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleStatusUpdate("FALSE_POSITIVE", "Mark False Positive", "This will mark the alert as a false positive.")}
                      disabled={updateAlert.isPending}
                    >
                      <Ban className="h-3 w-3" />
                      False Positive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground text-center">Alert not found</p>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          variant={confirmAction?.status === "FALSE_POSITIVE" ? "warning" : "default"}
          title={confirmAction?.label ?? ""}
          description={confirmAction?.description ?? ""}
          confirmLabel={confirmAction?.label ?? "Confirm"}
          onConfirm={confirmStatusUpdate}
          loading={updateAlert.isPending}
        />
      </DrawerContent>
    </Drawer>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
