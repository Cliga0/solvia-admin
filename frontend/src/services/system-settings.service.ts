import { apiUrl } from "@/constants/api";
import type {
  SystemSetting,
  PublicSetting,
  BulkUpdateSettingItem,
  BulkUpdateResult,
  SettingCategory,
} from "@/types/system-settings";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

async function publicGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const systemSettingsService = {
  getAll(): Promise<SystemSetting[]> {
    return authRequest<SystemSetting[]>("/system/settings");
  },

  getByCategory(category: SettingCategory): Promise<SystemSetting[]> {
    return authRequest<SystemSetting[]>(
      `/system/settings/category/${category}`,
    );
  },

  getByKey(key: string): Promise<SystemSetting> {
    return authRequest<SystemSetting>(`/system/settings/${encodeURIComponent(key)}`);
  },

  getPublicSettings(): Promise<PublicSetting[]> {
    return publicGet<PublicSetting[]>("/system/settings/public");
  },

  updateSetting(key: string, value: string): Promise<SystemSetting> {
    return authRequest<SystemSetting>(
      `/system/settings/${encodeURIComponent(key)}`,
      "PATCH",
      { value },
    );
  },

  bulkUpdate(items: BulkUpdateSettingItem[]): Promise<BulkUpdateResult> {
    return authRequest<BulkUpdateResult>("/system/settings", "PATCH", {
      items,
    });
  },
};
