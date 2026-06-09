"use client";

import { ReactNode } from "react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

interface ModuleLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function ModuleLayout({
  children,
  title,
  description,
  actions,
}: ModuleLayoutProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs />
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight mt-2">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
