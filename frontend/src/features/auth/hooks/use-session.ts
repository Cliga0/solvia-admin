"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

const PUBLIC_PATHS = ["/login", "/verify-2fa"];

export function useSession() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, accessToken, initialize, clearAuth } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (!isAuthenticated && !isPublicPath && !hasRedirected.current) {
      hasRedirected.current = true;
      const from = pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${from}`);
    }

    if (isAuthenticated && isPublicPath && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  return {
    isInitialized,
    isAuthenticated,
    accessToken,
    clearSession: clearAuth,
  };
}
