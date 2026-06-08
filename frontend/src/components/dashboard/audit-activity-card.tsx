"use client";

import type { AuditOverview } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";

interface Props {
  data: AuditOverview;
}

export function AuditActivityCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4 text-primary-600" />
            Audit Activity
          </CardTitle>
          <Badge variant="secondary">{data.totalLogs} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.logsToday}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.logsLast7Days}</p>
            <p className="text-xs text-muted-foreground">Last 7 Days</p>
          </div>
        </div>

        {data.recentAuditEvents.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Recent Events
            </p>
            {data.recentAuditEvents.slice(0, 5).map((evt) => (
              <div key={evt.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Badge variant="outline" className="text-[10px] shrink-0 px-1 py-0">
                    {evt.module}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {formatEvent(evt.event)}
                  </span>
                </div>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {formatTime(evt.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}

        {data.recentAuditEvents.length === 0 && (
          <p className="text-xs text-muted-foreground">No audit events recorded</p>
        )}
      </CardContent>
    </Card>
  );
}

function formatEvent(event: string): string {
  return event
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
