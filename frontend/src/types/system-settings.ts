export type SettingCategory =
  | "PLATFORM"
  | "BRANDING"
  | "SECURITY"
  | "MAINTENANCE"
  | "NOTIFICATIONS";

export type SettingValueType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON";

export interface SystemSetting {
  id: string;
  category: SettingCategory;
  key: string;
  value: string;
  valueType: SettingValueType;
  description: string | null;
  isPublic: boolean;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSetting {
  key: string;
  value: string;
  valueType: SettingValueType;
}

export interface BulkUpdateSettingItem {
  key: string;
  value: string;
}

export interface BulkUpdateResult {
  updated: number;
  settings: SystemSetting[];
}

export const SETTING_CATEGORY_LABELS: Record<SettingCategory, string> = {
  PLATFORM: "Platform",
  BRANDING: "Branding",
  SECURITY: "Security",
  MAINTENANCE: "Maintenance",
  NOTIFICATIONS: "Notifications",
};

export const SETTING_CATEGORIES: SettingCategory[] = [
  "PLATFORM",
  "BRANDING",
  "SECURITY",
  "MAINTENANCE",
  "NOTIFICATIONS",
];
