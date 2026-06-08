"use client";

import type { UserOverview } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";

interface Props {
  data: UserOverview;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-success-100 text-success-800",
  PENDING: "bg-warning-100 text-warning-800",
  SUSPENDED: "bg-error-100 text-error-800",
  DISABLED: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function UserOverviewCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4 text-primary-600" />
            User Overview
          </CardTitle>
          <Badge variant="secondary">{data.totalUsers} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <StatusPill label="Active" count={data.activeUsers} color="text-success-700" />
          <StatusPill label="Pending" count={data.pendingUsers} color="text-warning-700" />
          <StatusPill label="Suspended" count={data.suspendedUsers} color="text-error-700" />
          <StatusPill label="Disabled" count={data.disabledUsers} color="text-muted-foreground" />
          <StatusPill label="Archived" count={data.archivedUsers} color="text-muted-foreground" />
        </div>

        {data.recentUsers.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <UserPlus className="size-3" /> Recent Users
            </p>
            {data.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{user.email}</span>
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[user.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-md bg-muted/50 p-2 text-center">
      <p className={`text-lg font-semibold leading-none ${color}`}>{count}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
