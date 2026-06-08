import { apiUrl } from "@/constants/api";
import type {
  SecurityDashboardData,
  AlertSearchResponse,
  SecurityAlert,
  IncidentSearchResponse,
  SecurityIncident,
  UserRiskProfile,
  SecurityTimeline,
} from "@/types/security";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function authRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const securityService = {
  getDashboard(): Promise<SecurityDashboardData> {
    return authRequest<SecurityDashboardData>("/security/dashboard");
  },

  searchAlerts(params?: Record<string, string>): Promise<AlertSearchResponse> {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return authRequest<AlertSearchResponse>(`/security/alerts${query}`);
  },

  getAlert(id: string): Promise<SecurityAlert> {
    return authRequest<SecurityAlert>(`/security/alerts/${id}`);
  },

  updateAlert(id: string, data: { status: string; description?: string }): Promise<SecurityAlert> {
    return authRequest<SecurityAlert>(`/security/alerts/${id}`, "PATCH", data);
  },

  searchIncidents(params?: Record<string, string>): Promise<IncidentSearchResponse> {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return authRequest<IncidentSearchResponse>(`/security/incidents${query}`);
  },

  createIncident(data: { alertId?: string; assignedTo?: string; notes?: string }): Promise<SecurityIncident> {
    return authRequest<SecurityIncident>("/security/incidents", "POST", data);
  },

  updateIncident(id: string, data: { status: string; assignedTo?: string; notes?: string }): Promise<SecurityIncident> {
    return authRequest<SecurityIncident>(`/security/incidents/${id}`, "PATCH", data);
  },

  getUserRisk(userId: string): Promise<UserRiskProfile> {
    return authRequest<UserRiskProfile>(`/security/users/${userId}/risk`);
  },

  getUserTimeline(userId: string): Promise<SecurityTimeline> {
    return authRequest<SecurityTimeline>(`/security/users/${userId}/timeline`);
  },

  runDetection(): Promise<void> {
    return authRequest<void>("/security/monitoring/detect", "POST");
  },

  recalculateRisks(): Promise<number> {
    return authRequest<number>("/security/monitoring/recalculate-risks", "POST");
  },
};
