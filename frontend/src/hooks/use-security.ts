"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { securityService } from "@/services/security.service";

export function useSecurityDashboard() {
  return useQuery({
    queryKey: ["security", "dashboard"],
    queryFn: () => securityService.getDashboard(),
    staleTime: 60 * 1000,
  });
}

export function useSecurityAlerts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["security", "alerts", params],
    queryFn: () => securityService.searchAlerts(params),
  });
}

export function useSecurityIncidents(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["security", "incidents", params],
    queryFn: () => securityService.searchIncidents(params),
  });
}

export function useUserRisk(userId: string) {
  return useQuery({
    queryKey: ["security", "risk", userId],
    queryFn: () => securityService.getUserRisk(userId),
    enabled: !!userId,
  });
}

export function useUserTimeline(userId: string) {
  return useQuery({
    queryKey: ["security", "timeline", userId],
    queryFn: () => securityService.getUserTimeline(userId),
    enabled: !!userId,
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; description?: string } }) =>
      securityService.updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security"] });
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { alertId?: string; assignedTo?: string; notes?: string }) =>
      securityService.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security"] });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; assignedTo?: string; notes?: string } }) =>
      securityService.updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security"] });
    },
  });
}

export function useRunDetection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => securityService.runDetection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security"] });
    },
  });
}

export function useRecalculateRisks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => securityService.recalculateRisks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security"] });
    },
  });
}
