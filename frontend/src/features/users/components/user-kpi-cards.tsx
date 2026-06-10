"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "error" | "info";
  subValue?: string;
}

interface UserKpiGridProps {
  items: KpiItem[];
  columns?: 3 | 4 | 5 | 6;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "",
  success: "text-success-700 border-success-200 bg-success-50",
  warning: "text-warning-700 border-warning-200 bg-warning-50",
  error: "text-error-700 border-error-200 bg-error-50",
  info: "text-blue-700 border-blue-200 bg-blue-50",
};

const gridCols = { 3: "grid-cols-3", 4: "grid-cols-2 md:grid-cols-4", 5: "grid-cols-2 md:grid-cols-5", 6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" };

export function UserKpiGrid({ items, columns = 5, className }: UserKpiGridProps) {
  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Card key={i} className={cn("border", variantStyles[item.variant ?? "default"])}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {item.label}
                </p>
                {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </div>
              <p className="text-lg font-semibold mt-1">{item.value}</p>
              {item.subValue && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.subValue}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface RiskScoreCardProps {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastCalculatedAt: string;
  className?: string;
}

const riskColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  LOW: { bg: "bg-success-50", text: "text-success-700", border: "border-success-200", bar: "bg-success-500" },
  MEDIUM: { bg: "bg-warning-50", text: "text-warning-700", border: "border-warning-200", bar: "bg-warning-500" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", bar: "bg-orange-500" },
  CRITICAL: { bg: "bg-error-50", text: "text-error-700", border: "border-error-200", bar: "bg-error-500" },
};

export function RiskScoreCard({ score, level, lastCalculatedAt, className }: RiskScoreCardProps) {
  const colors = riskColors[level] || riskColors.LOW;
  const maxScore = 100;
  const percentage = Math.min(score / maxScore * 100, 100);

  return (
    <Card className={cn("border", colors.border, colors.bg, className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Score</p>
          <Badge className={cn("text-[10px] font-semibold border-0", colors.text, colors.bg)}>
            {level}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={cn("text-3xl font-bold", colors.text)}>{score}</span>
          <span className="text-xs text-muted-foreground">/ {maxScore}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted mb-2">
          <div
            className={cn("h-2 rounded-full transition-all", colors.bar)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Last calculated: {new Date(lastCalculatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

interface RiskBreakdownGridProps {
  breakdown: {
    failedLogins: number;
    twoFactorFailures: number;
    passwordResets: number;
    roleChanges: number;
    accountDisabled: number;
    securityIncidents: number;
  };
  className?: string;
}

export function RiskBreakdownGrid({ breakdown, className }: RiskBreakdownGridProps) {
  const items = [
    { label: "Failed Logins", value: breakdown.failedLogins, variant: breakdown.failedLogins > 0 ? "warning" : "default" as const },
    { label: "2FA Failures", value: breakdown.twoFactorFailures, variant: breakdown.twoFactorFailures > 0 ? "warning" : "default" as const },
    { label: "Password Resets", value: breakdown.passwordResets, variant: "default" as const },
    { label: "Role Changes", value: breakdown.roleChanges, variant: "default" as const },
    { label: "Account Disabled", value: breakdown.accountDisabled, variant: breakdown.accountDisabled > 0 ? "error" : "default" as const },
    { label: "Security Incidents", value: breakdown.securityIncidents, variant: breakdown.securityIncidents > 0 ? "error" : "default" as const },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-md border p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
          <p className={cn(
            "text-sm font-semibold mt-0.5",
            item.variant === "warning" && "text-warning-700",
            item.variant === "error" && "text-error-700",
          )}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
