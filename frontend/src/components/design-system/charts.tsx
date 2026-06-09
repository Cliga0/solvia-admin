"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
  actions?: React.ReactNode;
}

export function ChartWrapper({
  title,
  description,
  children,
  className,
  height = 300,
  actions,
}: ChartWrapperProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div style={{ height }} className="w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartLegendProps {
  items: Array<{
    label: string;
    color: string;
    value?: string | number;
  }>;
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.label}</span>
          {item.value !== undefined && (
            <span className="text-xs font-medium">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface StatChangeProps {
  value: number;
  className?: string;
  invertColors?: boolean;
}

export function StatChange({ value, className, invertColors = false }: StatChangeProps) {
  const isPositive = value >= 0;
  const actualIsPositive = invertColors ? !isPositive : isPositive;

  return (
    <span
      className={cn(
        "text-xs font-medium",
        actualIsPositive ? "text-success-600" : "text-error-600",
        className
      )}
    >
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}
