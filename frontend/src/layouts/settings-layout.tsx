"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings, Palette, Shield, Wrench, Bell, ChevronRight } from "lucide-react";

const SETTINGS_TABS = [
  { key: "platform", label: "Platform", href: "/settings", icon: Settings },
  { key: "branding", label: "Branding", href: "/settings/branding", icon: Palette },
  { key: "security", label: "Security", href: "/settings/security", icon: Shield },
  { key: "maintenance", label: "Maintenance", href: "/settings/maintenance", icon: Wrench },
  { key: "notifications", label: "Notifications", href: "/settings/notifications", icon: Bell },
];

interface SettingsLayoutProps {
  children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform configuration, security policies, and operational settings.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Navigation */}
        <aside className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {SETTINGS_TABS.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== "/settings" && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
