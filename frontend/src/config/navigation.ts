import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Shield, Settings, FileText, Users, AlertTriangle, FileSearch } from "lucide-react";

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  permissions?: string[];
  permissionMode?: "any" | "all";
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationSection {
  key: string;
  label?: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationSection[] = [
  {
    key: "main",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.read",
      },
    ],
  },
  {
    key: "identity",
    label: "Identity",
    items: [
      {
        key: "users",
        label: "Users",
        href: "/users",
        icon: Users,
        permission: "users.read",
      },
      {
        key: "roles",
        label: "Roles",
        href: "/rbac/roles",
        icon: Shield,
        permission: "roles.read",
      },
      {
        key: "permissions",
        label: "Permissions",
        href: "/rbac/permissions",
        icon: FileText,
        permission: "permissions.read",
      },
    ],
  },
  {
    key: "security",
    label: "Security",
    items: [
      {
        key: "security",
        label: "Security Center",
        href: "/security",
        icon: Shield,
        permission: "security.read",
        children: [
          {
            key: "alerts",
            label: "Alerts",
            href: "/security/alerts",
            icon: AlertTriangle,
            permission: "security.alerts.read",
          },
          {
            key: "incidents",
            label: "Incidents",
            href: "/security/incidents",
            icon: FileText,
            permission: "security.incidents.read",
          },
          {
            key: "rules",
            label: "Rules",
            href: "/security/rules",
            icon: FileText,
            permission: "security.rules.read",
          },
          {
            key: "risk",
            label: "Risk Profiles",
            href: "/security/risk",
            icon: Users,
            permission: "security.read",
          },
          {
            key: "timeline",
            label: "Timeline",
            href: "/security/timeline",
            icon: FileSearch,
            permission: "security.read",
          },
        ],
      },
    ],
  },
  {
    key: "audit",
    label: "Audit",
    items: [
      {
        key: "audit",
        label: "Audit Logs",
        href: "/audit",
        icon: FileSearch,
        permission: "audit.read",
      },
    ],
  },
  {
    key: "system",
    label: "System",
    items: [
      {
        key: "settings",
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "system.settings.read",
      },
    ],
  },
];

export function flattenNavigation(): NavigationItem[] {
  const items: NavigationItem[] = [];

  for (const section of navigationConfig) {
    for (const item of section.items) {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    }
  }

  return items;
}

export function getNavigationItemByKey(key: string): NavigationItem | undefined {
  return flattenNavigation().find((item) => item.key === key);
}

export function getNavigationItemByHref(href: string): NavigationItem | undefined {
  return flattenNavigation().find((item) => item.href === href);
}
