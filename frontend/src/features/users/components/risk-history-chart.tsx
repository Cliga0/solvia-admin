"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskHistoryEntry, RiskTrend } from "../types";

interface RiskHistoryChartProps {
  history: RiskHistoryEntry[];
  trend: RiskTrend[];
  className?: string;
}

const levelColors: Record<string, string> = {
  LOW: "text-success-700",
  MEDIUM: "text-warning-700",
  HIGH: "text-orange-700",
  CRITICAL: "text-error-700",
};

const levelBarColors: Record<string, string> = {
  LOW: "bg-success-500",
  MEDIUM: "bg-warning-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-error-500",
};

export function RiskHistoryChart({ history, trend, className }: RiskHistoryChartProps) {
  const maxScore = Math.max(...history.map((h) => h.riskScore), 1);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Risk Score History</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {history.length} entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Trend Summary */}
        {trend.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-md border p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
              <p className="text-sm font-semibold mt-0.5">
                {trend.reduce((sum, t) => sum + t.avgScore, 0) / trend.length}
              </p>
            </div>
            <div className="rounded-md border p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Peak Score</p>
              <p className="text-sm font-semibold mt-0.5 text-warning-700">
                {Math.max(...trend.map((t) => t.maxScore))}
              </p>
            </div>
            <div className="rounded-md border p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Score</p>
              <p className="text-sm font-semibold mt-0.5 text-success-700">
                {Math.min(...trend.map((t) => t.minScore))}
              </p>
            </div>
          </div>
        )}

        {/* Trend Bar Chart */}
        {trend.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Score Trend</p>
            <div className="flex items-end gap-1 h-24">
              {trend.map((t, i) => {
                const height = (t.avgScore / maxScore) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-muted-foreground">{Math.round(t.avgScore)}</span>
                    <div
                      className="w-full rounded-t bg-primary/60 transition-all min-h-[2px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                      {t.date.substring(5, 10)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History Timeline */}
        <div className="space-y-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Recent Calculations</p>
          {history.slice(0, 10).map((entry) => {
            const percentage = (entry.riskScore / 100) * 100;
            return (
              <div key={entry.id} className="flex items-center gap-3 py-1.5">
                <span className="text-[10px] text-muted-foreground w-20 shrink-0">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted">
                  <div
                    className={cn("h-1.5 rounded-full transition-all", levelBarColors[entry.riskLevel] || "bg-muted-foreground")}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
                <span className={cn("text-xs font-medium w-8 text-right", levelColors[entry.riskLevel] || "")}>
                  {entry.riskScore}
                </span>
                <Badge className={cn("text-[9px] border-0 px-1.5 py-0", levelColors[entry.riskLevel] || "")}>
                  {entry.riskLevel}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
