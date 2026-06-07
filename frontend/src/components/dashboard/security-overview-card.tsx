"use client";

import type { SecurityOverview } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, TriangleAlert as AlertTriangle } from "lucide-react";

interface Props {
  data: SecurityOverview;
}

export function SecurityOverviewCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="size-4 text-primary-600" />
          Security Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.failedLoginsToday}</p>
            <p className="text-xs text-muted-foreground">Failed Logins Today</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold leading-none">{data.twoFactorAdoptionRate}%</p>
              <ShieldCheck className="size-3.5 text-success-600" />
            </div>
            <p className="text-xs text-muted-foreground">2FA Adoption</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.suspendedUsers}</p>
            <p className="text-xs text-muted-foreground">Suspended Users</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-lg font-semibold leading-none">{data.disabledUsers}</p>
            <p className="text-xs text-muted-foreground">Disabled Users</p>
          </div>
        </div>

        {data.recentSecurityEvents.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-medium text-muted-foreground">Recent Security Events</p>
            {data.recentSecurityEvents.slice(0, 3).map((evt, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs"
              >
                <AlertTriangle className="size-3 text-warning-600 shrink-0" />
                <span className="text-muted-foreground truncate">
                  {formatEvent(evt.event)}
                </span>
              </div>
            ))}
          </div>
        )}

        {data.recentSecurityEvents.length === 0 && (
          <p className="text-xs text-muted-foreground">No recent security events</p>
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
