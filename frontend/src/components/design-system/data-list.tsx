"use client";

import { cn } from "@/lib/utils";

interface DataListProps {
  items: Array<{
    label: string;
    value: React.ReactNode;
    className?: string;
  }>;
  className?: string;
  columns?: 1 | 2 | 3;
  labelWidth?: string;
}

export function DataList({
  items,
  className,
  columns = 1,
  labelWidth = "120px",
}: DataListProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  return (
    <div className={cn("grid", gridCols[columns], "gap-3", className)}>
      {items.map((item, index) => (
        <div key={index} className={cn("flex", item.className)}>
          <span
            className="text-xs text-muted-foreground shrink-0"
            style={{ width: labelWidth }}
          >
            {item.label}
          </span>
          <span className="text-xs font-medium ml-2">{item.value ?? "-"}</span>
        </div>
      ))}
    </div>
  );
}

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DataRow({ label, value, className }: DataRowProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "-"}</span>
    </div>
  );
}

interface DataSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DataSection({ title, children, className }: DataSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
