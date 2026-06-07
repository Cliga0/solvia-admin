import { apiUrl } from "@/constants/api";
import type { DashboardData } from "@/types/dashboard";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function authGet<T>(endpoint: string): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${apiUrl}${endpoint}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const dashboardService = {
  getDashboard(): Promise<DashboardData> {
    return authGet<DashboardData>("/dashboard");
  },
};
