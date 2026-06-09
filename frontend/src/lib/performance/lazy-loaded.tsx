"use client";

import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/states/loading-state";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loadingMessage?: string;
  }
) {
  const LazyComponent = lazy(importFn);

  const LazyWrapper = (props: React.ComponentProps<T>) => {
    return (
      <Suspense
        fallback={
          <LoadingState message={options?.loadingMessage} className="min-h-[200px]" />
        }
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };

  LazyWrapper.displayName = "LazyComponent";
  return LazyWrapper;
}

export function LazyPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <LoadingState message="Loading page..." className="min-h-[400px]" />
      }
    >
      {children}
    </Suspense>
  );
}
