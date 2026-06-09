"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

const PUBLIC_PATHS = ["/login", "/verify-2fa"];

interface AuthGuardProps {
  children: React.ReactNode;
  publicPaths?: string[];
}

export function AuthGuard({ children, publicPaths = PUBLIC_PATHS }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInitialized, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (!isAuthenticated && !isPublicPath) {
      const from = pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${from}`);
    }

    if (isAuthenticated && isPublicPath) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, pathname, publicPaths, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
