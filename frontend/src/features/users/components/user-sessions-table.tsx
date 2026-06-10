"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, MapPin, Clock, LogOut, Search, ArrowUpDown } from "lucide-react";
import type { UserSession } from "../types";

interface UserSessionsTableProps {
  sessions: UserSession[];
  onForceLogoutAll?: () => void;
  onForceLogoutOne?: (sessionId: string) => void;
  forceLogoutLoading?: boolean;
  className?: string;
}

type SortField = "loginAt" | "lastActiveAt" | "ip";

export function UserSessionsTable({
  sessions,
  onForceLogoutAll,
  onForceLogoutOne,
  forceLogoutLoading,
  className,
}: UserSessionsTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("lastActiveAt");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const matched = sessions.filter((s) => {
      const searchStr = `${s.userAgent || ""} ${s.ip || ""} ${s.id}`.toLowerCase();
      return searchStr.includes(q);
    });
    const result = [...matched].sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [sessions, search, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const activeCount = sessions.filter((s) => !s.isRevoked).length;
  const revokedCount = sessions.filter((s) => s.isRevoked).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Active Sessions</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {activeCount} active / {revokedCount} revoked
            </Badge>
          </div>
          {onForceLogoutAll && activeCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={onForceLogoutAll}
              disabled={forceLogoutLoading}
            >
              <LogOut className="h-3 w-3" />
              Force Logout All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by device, IP, or session ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Sort headers */}
        <div className="grid grid-cols-[1fr_100px_130px_130px_80px_40px] gap-2 px-3 py-2 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span>Device / Browser</span>
          <button type="button" onClick={() => toggleSort("ip")} className="flex items-center gap-1 hover:text-foreground">
            IP <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <button type="button" onClick={() => toggleSort("loginAt")} className="flex items-center gap-1 hover:text-foreground">
            Login Time <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <button type="button" onClick={() => toggleSort("lastActiveAt")} className="flex items-center gap-1 hover:text-foreground">
            Last Active <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <span>Status</span>
          <span></span>
        </div>

        {/* Sessions list */}
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <Monitor className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {sessions.length === 0 ? "No sessions found" : "No sessions match your search"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((session) => (
              <div
                key={session.id}
                className="grid grid-cols-[1fr_100px_130px_130px_80px_40px] gap-2 px-3 py-2.5 items-center text-xs hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Monitor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate" title={session.userAgent || undefined}>
                    {parseUserAgent(session.userAgent)}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {session.ip || "-"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  {formatTime(session.loginAt)}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  {formatTime(session.lastActiveAt)}
                </span>
                <Badge
                  variant={session.isRevoked ? "secondary" : "default"}
                  className="text-[10px] justify-center"
                >
                  {session.isRevoked ? "Revoked" : "Active"}
                </Badge>
                {!session.isRevoked && onForceLogoutOne && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => onForceLogoutOne(session.id)}
                    title="Force logout this session"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserSessionsTableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-full mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-1" />
        ))}
      </CardContent>
    </Card>
  );
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (ua.includes("Chrome") && ua.includes("Safari") && !ua.includes("Edg")) {
    const browser = "Chrome";
    const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Linux") ? "Linux" : "Unknown OS";
    return `${browser} on ${os}`;
  }
  if (ua.includes("Firefox")) return `Firefox on ${ua.includes("Mac") ? "macOS" : "Unknown OS"}`;
  if (ua.includes("Safari") && !ua.includes("Chrome")) return `Safari on macOS`;
  if (ua.includes("Edg")) return `Edge on ${ua.includes("Windows") ? "Windows" : "Unknown OS"}`;
  return ua.substring(0, 40);
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
