"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
}

const variantColors = {
  default: "",
  success: "text-success-600",
  warning: "text-warning-600",
  error: "text-error-600",
};

const sizeClasses = {
  sm: { label: "text-[10px]", value: "text-base" },
  md: { label: "text-xs", value: "text-xl" },
  lg: { label: "text-sm", value: "text-2xl" },
};

export function MetricCard({
  label,
  value,
  subValue,
  className,
  size = "md",
  variant = "default",
}: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-3">
        <p className={cn("text-muted-foreground", sizeClasses[size].label)}>
          {label}
        </p>
        <p
          className={cn(
            "font-semibold mt-1",
            sizeClasses[size].value,
            variantColors[variant],
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}
