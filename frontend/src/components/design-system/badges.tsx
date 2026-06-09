"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertSeverity, AlertStatus, RiskLevel } from "@/types/security";

const severityVariants: Record<AlertSeverity, string> = {
  LOW: "bg-success-100 text-success-800 hover:bg-success-100",
  MEDIUM: "bg-warning-100 text-warning-800 hover:bg-warning-100",
  HIGH: "bg-error-100 text-error-800 hover:bg-error-100",
  CRITICAL: "bg-error-200 text-error-900 font-semibold hover:bg-error-200",
};

const statusVariants: Record<AlertStatus, string> = {
  OPEN: "bg-error-100 text-error-800 hover:bg-error-100",
  INVESTIGATING: "bg-warning-100 text-warning-800 hover:bg-warning-100",
  RESOLVED: "bg-success-100 text-success-800 hover:bg-success-100",
  FALSE_POSITIVE: "bg-muted text-muted-foreground hover:bg-muted",
};

const riskVariants: Record<RiskLevel, string> = {
  LOW: "bg-success-100 text-success-800 hover:bg-success-100",
  MEDIUM: "bg-warning-100 text-warning-800 hover:bg-warning-100",
  HIGH: "bg-error-100 text-error-800 hover:bg-error-100",
  CRITICAL: "bg-error-200 text-error-900 font-semibold hover:bg-error-200",
};

interface SeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium border-0", severityVariants[severity], className)}
    >
      {severity}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: AlertStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium border-0", statusVariants[status], className)}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium border-0", riskVariants[level], className)}
    >
      {level}
      {score !== undefined && <span className="ml-1">({score})</span>}
    </Badge>
  );
}

interface IncidentStatusBadgeProps {
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  className?: string;
}

const incidentStatusVariants = {
  OPEN: "bg-error-100 text-error-800 hover:bg-error-100",
  INVESTIGATING: "bg-warning-100 text-warning-800 hover:bg-warning-100",
  RESOLVED: "bg-success-100 text-success-800 hover:bg-success-100",
};

export function IncidentStatusBadge({ status, className }: IncidentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium border-0", incidentStatusVariants[status], className)}
    >
      {status}
    </Badge>
  );
}
