export const queryKeys = {
  // Auth
  auth: {
    user: () => ["auth", "user"] as const,
    session: () => ["auth", "session"] as const,
    permissions: () => ["auth", "permissions"] as const,
  },

  // Dashboard
  dashboard: {
    all: () => ["dashboard"] as const,
    main: () => ["dashboard", "main"] as const,
  },

  // Users
  users: {
    all: () => ["users"] as const,
    list: (params?: Record<string, unknown>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    roles: (id: string) => ["users", id, "roles"] as const,
    permissions: (id: string) => ["users", id, "permissions"] as const,
    sessions: (id: string) => ["users", id, "sessions"] as const,
    securityProfile: (id: string) => ["users", id, "securityProfile"] as const,
  },

  // Roles
  roles: {
    all: () => ["roles"] as const,
    list: () => ["roles", "list"] as const,
    detail: (id: string) => ["roles", "detail", id] as const,
    permissions: (id: string) => ["roles", id, "permissions"] as const,
  },

  // Permissions
  permissions: {
    all: () => ["permissions"] as const,
    list: () => ["permissions", "list"] as const,
  },

  // Audit
  audit: {
    all: () => ["audit"] as const,
    logs: (params?: Record<string, unknown>) => ["audit", "logs", params] as const,
    stats: () => ["audit", "stats"] as const,
    detail: (id: string) => ["audit", "detail", id] as const,
  },

  // Security
  security: {
    all: () => ["security"] as const,
    dashboard: () => ["security", "dashboard"] as const,
    alerts: (params?: Record<string, unknown>) => ["security", "alerts", params] as const,
    alert: (id: string) => ["security", "alert", id] as const,
    incidents: (params?: Record<string, unknown>) => ["security", "incidents", params] as const,
    incident: (id: string) => ["security", "incident", id] as const,
    rules: () => ["security", "rules"] as const,
    rule: (id: string) => ["security", "rule", id] as const,
    riskProfile: (userId: string) => ["security", "risk", userId] as const,
    timeline: (userId: string) => ["security", "timeline", userId] as const,
    globalTimeline: (params?: Record<string, unknown>) => ["security", "globalTimeline", params] as const,
    correlations: () => ["security", "correlations"] as const,
  },

  // System Settings
  settings: {
    all: () => ["settings"] as const,
    category: (category: string) => ["settings", "category", category] as const,
    key: (key: string) => ["settings", "key", key] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
