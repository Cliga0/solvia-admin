"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import {
  LayoutDashboard,
  Shield,
  Settings,
  LogOut,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Security", href: "/security", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Users", href: "/users", icon: Users },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r bg-card">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Solvia Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
