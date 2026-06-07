"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemSettingsService } from "@/services/system-settings.service";
import type {
  SettingCategory,
  BulkUpdateSettingItem,
} from "@/types/system-settings";

export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: () => systemSettingsService.getAll(),
  });
}

export function useSystemSettingsByCategory(category: SettingCategory) {
  return useQuery({
    queryKey: ["system-settings", "category", category],
    queryFn: () => systemSettingsService.getByCategory(category),
  });
}

export function useSystemSetting(key: string) {
  return useQuery({
    queryKey: ["system-settings", key],
    queryFn: () => systemSettingsService.getByKey(key),
    enabled: !!key,
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemSettingsService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
}

export function useBulkUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: BulkUpdateSettingItem[]) =>
      systemSettingsService.bulkUpdate(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
}
