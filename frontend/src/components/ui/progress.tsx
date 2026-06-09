"use client";

import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  default: "h-2",
  lg: "h-3",
};

export function ProgressComponent({
  className,
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = "default",
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <Progress.Root
      className={cn("relative overflow-hidden rounded-full bg-muted", sizeClasses[size], className)}
      value={value}
      max={max}
    >
      <Progress.Indicator
        className="h-full w-full bg-primary transition-transform duration-150"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
      {showValue && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
          {Math.round(percentage)}%
        </span>
      )}
    </Progress.Root>
  );
}

export { ProgressComponent as ProgressBar };
