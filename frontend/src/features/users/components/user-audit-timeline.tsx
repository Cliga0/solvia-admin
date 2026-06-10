"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditLogEntry } from "../types";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";

interface UserAuditTimelineProps {
  auditData: AuditLogEntry[];
  pagination: { page: number; pages: number; total: number };
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: { event?: string; module?: string }) => void;
  onRetry?: () => void;
  className?: string;
}

const EVENT_VARIANTS: Record<string, string> = {
  USER_CREATED: "bg-success-100 text-success-800",
  USER_UPDATED: "bg-blue-100 text-blue-800",
  USER_SUSPENDED: "bg-warning-100 text-warning-800",
  USER_REACTIVATED: "bg-success-100 text-success-800",
  USER_DISABLED: "bg-error-100 text-error-800",
  USER_ARCHIVED: "bg-muted text-muted-foreground",
  USER_ROLE_ASSIGNED: "bg-blue-100 text-blue-800",
  USER_ROLE_REMOVED: "bg-orange-100 text-orange-800",
  USER_PASSWORD_RESET_ADMIN: "bg-warning-100 text-warning-800",
  USER_SESSION_REVOKED: "bg-warning-100 text-warning-800",
  TWO_FACTOR_ENABLED: "bg-success-100 text-success-800",
  TWO_FACTOR_DISABLED: "bg-error-100 text-error-800",
  AUTH_LOGIN_SUCCESS: "bg-success-100 text-success-800",
  AUTH_LOGIN_FAILED: "bg-error-100 text-error-800",
};

const USER_EVENTS = [
  "USER_CREATED", "USER_UPDATED", "USER_SUSPENDED", "USER_REACTIVATED",
  "USER_DISABLED", "USER_ARCHIVED", "USER_ROLE_ASSIGNED", "USER_ROLE_REMOVED",
  "USER_PASSWORD_RESET_ADMIN", "USER_SESSION_REVOKED", "TWO_FACTOR_ENABLED",
  "TWO_FACTOR_DISABLED", "AUTH_LOGIN_SUCCESS", "AUTH_LOGIN_FAILED",
];

export function UserAuditTimeline({
  auditData,
  pagination,
  isLoading,
  isError,
  error,
  onPageChange,
  onFilterChange,
  onRetry,
  className,
}: UserAuditTimelineProps) {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("");

  const filtered = search
    ? auditData.filter((entry) => {
        const s = search.toLowerCase();
        return (
          entry.event.toLowerCase().includes(s) ||
          entry.module.toLowerCase().includes(s) ||
          (entry.metadata && JSON.stringify(entry.metadata).toLowerCase().includes(s))
        );
      })
    : auditData;

  const handleEventFilterChange = (value: string | null) => {
    const v = value ?? "";
    setEventFilter(v);
    onFilterChange?.({ event: v || undefined });
  };

  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <ErrorState
            title="Failed to load audit logs"
            message={error?.message || "An error occurred"}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Audit Timeline</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {pagination.total} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={eventFilter} onValueChange={handleEventFilterChange}>
            <SelectTrigger className="h-8 w-44 text-xs">
              {eventFilter || "All events"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All events</SelectItem>
              {USER_EVENTS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-2 w-2 rounded-full mt-2 shrink-0" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No audit events"
            message="No audit events found for this user."
          />
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-0">
              {filtered.map((entry) => (
                <div key={entry.id} className="flex gap-3 py-2 group">
                  {/* Dot */}
                  <div className="relative z-10 mt-1.5">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full border-2 border-background",
                      EVENT_VARIANTS[entry.event]?.includes("error") ? "bg-error-500" :
                      EVENT_VARIANTS[entry.event]?.includes("warning") ? "bg-warning-500" :
                      EVENT_VARIANTS[entry.event]?.includes("success") ? "bg-success-500" :
                      "bg-muted-foreground"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] border-0", EVENT_VARIANTS[entry.event] || "bg-muted text-muted-foreground")}
                      >
                        {entry.event.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>Module: {entry.module}</span>
                      {entry.ip && <span>IP: {entry.ip}</span>}
                      {entry.resourceType && <span>Resource: {entry.resourceType}</span>}
                    </div>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {JSON.stringify(entry.metadata).substring(0, 100)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <p className="text-[10px] text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || isLoading}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
