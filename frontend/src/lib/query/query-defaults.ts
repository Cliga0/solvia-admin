import type { QueryClient } from "@tanstack/react-query";

export const DEFAULT_STALE_TIME = 60 * 1000; // 1 minute
export const DEFAULT_GC_TIME = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_RETRY = 1;
export const DEFAULT_RETRY_DELAY = 1000;

export const queryDefaults = {
  queries: {
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: DEFAULT_RETRY,
    retryDelay: DEFAULT_RETRY_DELAY,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
};

export async function invalidateAllQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries();
}

export async function invalidateQueriesByPrefix(
  queryClient: QueryClient,
  prefix: string[],
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: prefix,
  });
}

export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<T>,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

export function setQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  data: T,
): void {
  queryClient.setQueryData(queryKey, data);
}

export function getQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

export function createOptimisticUpdate<T, V>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updater: (old: T | undefined, newValue: V) => T,
) {
  return (newValue: V) => {
    queryClient.setQueryData(queryKey, (old: T | undefined) => updater(old, newValue));
  };
}
