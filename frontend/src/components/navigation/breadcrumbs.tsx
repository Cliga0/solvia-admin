"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (!pathname || pathname === "/") {
      setItems([]);
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];

    let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const isLast = i === segments.length - 1;

      const label = formatSegment(segments[i]);

      crumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }

    setItems(crumbs);
  }, [pathname]);

  if (items.length === 0) return null;

  return (
    <nav
      className={cn("flex items-center gap-1 text-xs", className)}
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3 w-3" />
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

function formatSegment(segment: string): string {
  const segmentMap: Record<string, string> = {
    dashboard: "Dashboard",
    users: "Users",
    roles: "Roles",
    rbac: "RBAC",
    security: "Security",
    alerts: "Alerts",
    incidents: "Incidents",
    rules: "Rules",
    risk: "Risk Profiles",
    timeline: "Timeline",
    audit: "Audit",
    settings: "Settings",
    permissions: "Permissions",
  };

  if (segmentMap[segment]) {
    return segmentMap[segment];
  }

  if (segment.match(/^[a-f0-9-]{36}$/i)) {
    return "Details";
  }

  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
