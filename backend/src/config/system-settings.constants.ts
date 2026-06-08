export const SettingCategories = {
  PLATFORM: "PLATFORM",
  BRANDING: "BRANDING",
  SECURITY: "SECURITY",
  MAINTENANCE: "MAINTENANCE",
  NOTIFICATIONS: "NOTIFICATIONS",
} as const;

export type SettingCategoryType =
  (typeof SettingCategories)[keyof typeof SettingCategories];

export const SettingValueTypes = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  JSON: "JSON",
} as const;

export type SettingValueTypeType =
  (typeof SettingValueTypes)[keyof typeof SettingValueTypes];

export const REDIS_KEYS_SETTINGS = {
  ALL: "settings:all",
  CATEGORY: "settings:category:",
} as const;

const SETTINGS_CACHE_TTL_SECONDS = 300;

export { SETTINGS_CACHE_TTL_SECONDS };
