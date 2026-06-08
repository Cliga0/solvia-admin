"use client";

import type { SecurityDashboardData } from "@/types/security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Props {
  data: SecurityDashboardData;
}

export function RecentActivityCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-4 text-primary-600" />
          Recent Security Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.recentAlerts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No recent security activity
          </p>
        )}
        <div className="space-y-2">
          {data.recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 text-xs rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="text-muted-foreground shrink-0">
                {formatTime(alert.createdAt)}
              </span>
              <span className="truncate flex-1">{alert.title}</span>
              <span className="text-muted-foreground shrink-0">{alert.type.replace(/_/g, " ")}</span>
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
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
  } catch {
    return "";
  }
}
