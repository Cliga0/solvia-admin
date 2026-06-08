import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Dashboard
  { code: "dashboard.read", description: "View the main dashboard" },
  // Users
  { code: "users.read", description: "View users" },
  { code: "users.create", description: "Create new users" },
  { code: "users.update", description: "Update user details" },
  { code: "users.suspend", description: "Suspend, disable or archive users" },
  { code: "users.assignRole", description: "Assign and remove user roles" },
  // Roles
  { code: "roles.read", description: "View roles" },
  { code: "roles.create", description: "Create roles" },
  { code: "roles.update", description: "Update roles" },
  { code: "roles.delete", description: "Delete roles" },
  // Permissions
  { code: "permissions.read", description: "View permissions" },
  // Audit
  { code: "audit.read", description: "View audit logs" },
  // System Settings
  { code: "system.settings.read", description: "View system settings" },
  { code: "system.settings.update", description: "Update system settings" },
  // Security
  { code: "security.read", description: "View security overview and risk profiles" },
  { code: "security.alerts.read", description: "View security alerts" },
  { code: "security.alerts.manage", description: "Manage and resolve security alerts" },
  { code: "security.incidents.read", description: "View security incidents" },
  { code: "security.incidents.manage", description: "Create and manage security incidents" },
  { code: "security.rules.read", description: "View security detection rules" },
  { code: "security.rules.manage", description: "Update security detection rules" },
];

const ALL_PERMISSION_CODES = PERMISSIONS.map((p) => p.code);

const SUPER_ADMIN_PERMISSIONS = ALL_PERMISSION_CODES;

const SECURITY_ANALYST_PERMISSIONS = [
  "dashboard.read",
  "security.read",
  "security.alerts.read",
  "security.alerts.manage",
  "security.incidents.read",
  "security.incidents.manage",
  "security.rules.read",
  "audit.read",
  "users.read",
];

const AUDITOR_PERMISSIONS = [
  "dashboard.read",
  "audit.read",
  "security.read",
  "security.alerts.read",
  "security.incidents.read",
  "users.read",
];

const SYSTEM_SETTINGS = [
  // PLATFORM
  { category: "PLATFORM" as const, key: "platform_name", value: "Solvia Administration Centrale", valueType: "STRING" as const, description: "Display name of the platform", isPublic: true, isEditable: true },
  { category: "PLATFORM" as const, key: "support_email", value: "support@solvia.io", valueType: "STRING" as const, description: "Support contact email", isPublic: true, isEditable: true },
  { category: "PLATFORM" as const, key: "platform_version", value: "1.0.0", valueType: "STRING" as const, description: "Current platform version", isPublic: true, isEditable: false },
  { category: "PLATFORM" as const, key: "default_timezone", value: "UTC", valueType: "STRING" as const, description: "Default timezone for the platform", isPublic: true, isEditable: true },
  { category: "PLATFORM" as const, key: "default_language", value: "en", valueType: "STRING" as const, description: "Default language code", isPublic: true, isEditable: true },

  // BRANDING
  { category: "BRANDING" as const, key: "logo_url", value: "", valueType: "STRING" as const, description: "URL to the platform logo", isPublic: true, isEditable: true },
  { category: "BRANDING" as const, key: "primary_color", value: "#0f172a", valueType: "STRING" as const, description: "Primary brand color (hex)", isPublic: true, isEditable: true },
  { category: "BRANDING" as const, key: "favicon_url", value: "", valueType: "STRING" as const, description: "URL to the platform favicon", isPublic: true, isEditable: true },

  // SECURITY
  { category: "SECURITY" as const, key: "password_min_length", value: "8", valueType: "NUMBER" as const, description: "Minimum password length", isPublic: false, isEditable: true },
  { category: "SECURITY" as const, key: "password_require_uppercase", value: "true", valueType: "BOOLEAN" as const, description: "Require uppercase letters in passwords", isPublic: false, isEditable: true },
  { category: "SECURITY" as const, key: "password_require_numbers", value: "true", valueType: "BOOLEAN" as const, description: "Require numbers in passwords", isPublic: false, isEditable: true },
  { category: "SECURITY" as const, key: "max_login_attempts", value: "10", valueType: "NUMBER" as const, description: "Maximum failed login attempts before lockout", isPublic: false, isEditable: true },
  { category: "SECURITY" as const, key: "session_timeout", value: "900", valueType: "NUMBER" as const, description: "Session timeout in seconds", isPublic: false, isEditable: true },
  { category: "SECURITY" as const, key: "two_factor_required", value: "false", valueType: "BOOLEAN" as const, description: "Enforce two-factor authentication for all users", isPublic: false, isEditable: true },
  { category: "SECURITY" as const, key: "ip_allowlist_enabled", value: "false", valueType: "BOOLEAN" as const, description: "Restrict access to allowed IPs only", isPublic: false, isEditable: true },

  // MAINTENANCE
  { category: "MAINTENANCE" as const, key: "maintenance_enabled", value: "false", valueType: "BOOLEAN" as const, description: "Enable maintenance mode (blocks non-admin access)", isPublic: true, isEditable: true },
  { category: "MAINTENANCE" as const, key: "maintenance_message", value: "The platform is currently undergoing scheduled maintenance. Please check back later.", valueType: "STRING" as const, description: "Message displayed during maintenance", isPublic: true, isEditable: true },
  { category: "MAINTENANCE" as const, key: "backup_enabled", value: "true", valueType: "BOOLEAN" as const, description: "Enable automatic database backups", isPublic: false, isEditable: true },
  { category: "MAINTENANCE" as const, key: "backup_retention_days", value: "30", valueType: "NUMBER" as const, description: "Number of days to retain backups", isPublic: false, isEditable: true },

  // NOTIFICATIONS
  { category: "NOTIFICATIONS" as const, key: "email_enabled", value: "true", valueType: "BOOLEAN" as const, description: "Enable email notifications", isPublic: false, isEditable: true },
  { category: "NOTIFICATIONS" as const, key: "sms_enabled", value: "false", valueType: "BOOLEAN" as const, description: "Enable SMS notifications", isPublic: false, isEditable: true },
  { category: "NOTIFICATIONS" as const, key: "slack_enabled", value: "false", valueType: "BOOLEAN" as const, description: "Enable Slack notifications", isPublic: false, isEditable: true },
  { category: "NOTIFICATIONS" as const, key: "alert_notifications_enabled", value: "true", valueType: "BOOLEAN" as const, description: "Send notifications for security alerts", isPublic: false, isEditable: true },
  { category: "NOTIFICATIONS" as const, key: "incident_notifications_enabled", value: "true", valueType: "BOOLEAN" as const, description: "Send notifications for security incidents", isPublic: false, isEditable: true },
];

const SECURITY_RULES = [
  {
    code: "RULE_FAILED_LOGIN_SPIKE",
    name: "Failed Login Spike",
    description: "Triggers when there are more than 10 failed login attempts within 15 minutes",
    alertType: "FAILED_LOGIN_SPIKE" as const,
    severity: "HIGH" as const,
    threshold: 10,
    windowMinutes: 15,
    enabled: true,
    autoCreateIncident: false,
    incidentSeverityThreshold: "CRITICAL" as const,
  },
  {
    code: "RULE_TWO_FACTOR_FAILURE_SPIKE",
    name: "2FA Failure Spike",
    description: "Triggers when there are more than 5 two-factor authentication failures within 15 minutes",
    alertType: "TWO_FACTOR_FAILURE_SPIKE" as const,
    severity: "HIGH" as const,
    threshold: 5,
    windowMinutes: 15,
    enabled: true,
    autoCreateIncident: true,
    incidentSeverityThreshold: "HIGH" as const,
  },
  {
    code: "RULE_PERMISSION_DENIED_SPIKE",
    name: "Permission Denied Spike",
    description: "Triggers when there are more than 20 permission denied events within 10 minutes",
    alertType: "PERMISSION_DENIED_SPIKE" as const,
    severity: "MEDIUM" as const,
    threshold: 20,
    windowMinutes: 10,
    enabled: true,
    autoCreateIncident: false,
    incidentSeverityThreshold: "HIGH" as const,
  },
  {
    code: "RULE_USER_DISABLED_EVENT",
    name: "User Disabling Activity",
    description: "Triggers when 2 or more users are disabled or suspended within 30 minutes",
    alertType: "USER_DISABLED_EVENT" as const,
    severity: "HIGH" as const,
    threshold: 2,
    windowMinutes: 30,
    enabled: true,
    autoCreateIncident: true,
    incidentSeverityThreshold: "HIGH" as const,
  },
  {
    code: "RULE_ROLE_ASSIGNMENT_EVENT",
    name: "Unusual Role Assignment Activity",
    description: "Triggers when there are more than 3 role assignment events within 15 minutes",
    alertType: "ROLE_ASSIGNMENT_EVENT" as const,
    severity: "MEDIUM" as const,
    threshold: 3,
    windowMinutes: 15,
    enabled: true,
    autoCreateIncident: false,
    incidentSeverityThreshold: "HIGH" as const,
  },
  {
    code: "RULE_SECURITY_CONFIGURATION_CHANGED",
    name: "Security Configuration Changed",
    description: "Triggers when platform security settings are modified",
    alertType: "SECURITY_CONFIGURATION_CHANGED" as const,
    severity: "MEDIUM" as const,
    threshold: 1,
    windowMinutes: 60,
    enabled: true,
    autoCreateIncident: false,
    incidentSeverityThreshold: "CRITICAL" as const,
  },
];

async function main() {
  console.log("Starting seed...");

  // =========================
  // PERMISSIONS
  // =========================
  console.log("Seeding permissions...");
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
  }

  // =========================
  // ROLES
  // =========================
  console.log("Seeding roles...");

  const superAdminRole = await prisma.role.upsert({
    where: { code: "SUPER_ADMIN" },
    update: { name: "Super Administrator", description: "Full access to all platform features" },
    create: {
      code: "SUPER_ADMIN",
      name: "Super Administrator",
      description: "Full access to all platform features",
      isSystem: true,
    },
  });

  const securityAnalystRole = await prisma.role.upsert({
    where: { code: "SECURITY_ANALYST" },
    update: { name: "Security Analyst", description: "Manages security alerts, incidents and monitoring" },
    create: {
      code: "SECURITY_ANALYST",
      name: "Security Analyst",
      description: "Manages security alerts, incidents and monitoring",
      isSystem: true,
    },
  });

  const auditorRole = await prisma.role.upsert({
    where: { code: "AUDITOR" },
    update: { name: "Auditor", description: "Read-only access to audit logs and security data" },
    create: {
      code: "AUDITOR",
      name: "Auditor",
      description: "Read-only access to audit logs and security data",
      isSystem: true,
    },
  });

  // =========================
  // ROLE PERMISSIONS
  // =========================
  console.log("Seeding role permissions...");

  const allPermissions = await prisma.permission.findMany();
  const permByCode = new Map(allPermissions.map((p) => [p.code, p.id]));

  async function assignPermissionsToRole(roleId: string, codes: string[]) {
    for (const code of codes) {
      const permId = permByCode.get(code);
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        update: {},
        create: { roleId, permissionId: permId },
      });
    }
  }

  await assignPermissionsToRole(superAdminRole.id, SUPER_ADMIN_PERMISSIONS);
  await assignPermissionsToRole(securityAnalystRole.id, SECURITY_ANALYST_PERMISSIONS);
  await assignPermissionsToRole(auditorRole.id, AUDITOR_PERMISSIONS);

  // =========================
  // USERS
  // =========================
  console.log("Seeding users...");

  const superAdminPassword = await argon2.hash("Admin@Solvia2026!");
  const demoUserPassword = await argon2.hash("Demo@Solvia2026!");

  const superAdmin = await prisma.internalUser.upsert({
    where: { email: "admin@solvia.io" },
    update: {},
    create: {
      email: "admin@solvia.io",
      passwordHash: superAdminPassword,
      isActive: true,
      status: "ACTIVE",
      twoFactorEnabled: false,
    },
  });

  const analyst = await prisma.internalUser.upsert({
    where: { email: "analyst@solvia.io" },
    update: {},
    create: {
      email: "analyst@solvia.io",
      passwordHash: demoUserPassword,
      isActive: true,
      status: "ACTIVE",
      twoFactorEnabled: false,
    },
  });

  const auditor = await prisma.internalUser.upsert({
    where: { email: "auditor@solvia.io" },
    update: {},
    create: {
      email: "auditor@solvia.io",
      passwordHash: demoUserPassword,
      isActive: true,
      status: "ACTIVE",
      twoFactorEnabled: false,
    },
  });

  const demoUser = await prisma.internalUser.upsert({
    where: { email: "demo@solvia.io" },
    update: {},
    create: {
      email: "demo@solvia.io",
      passwordHash: demoUserPassword,
      isActive: true,
      status: "ACTIVE",
      twoFactorEnabled: false,
    },
  });

  const suspendedUser = await prisma.internalUser.upsert({
    where: { email: "suspended@solvia.io" },
    update: {},
    create: {
      email: "suspended@solvia.io",
      passwordHash: demoUserPassword,
      isActive: false,
      status: "SUSPENDED",
      twoFactorEnabled: false,
    },
  });

  // Assign roles to users
  async function assignRoleToUser(userId: string, roleId: string) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  }

  await assignRoleToUser(superAdmin.id, superAdminRole.id);
  await assignRoleToUser(analyst.id, securityAnalystRole.id);
  await assignRoleToUser(auditor.id, auditorRole.id);

  // =========================
  // SYSTEM SETTINGS
  // =========================
  console.log("Seeding system settings...");

  for (const setting of SYSTEM_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { category_key: { category: setting.category, key: setting.key } },
      update: { description: setting.description },
      create: setting,
    });
  }

  // =========================
  // SECURITY RULES
  // =========================
  console.log("Seeding security rules...");

  for (const rule of SECURITY_RULES) {
    await prisma.securityRule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        threshold: rule.threshold,
        windowMinutes: rule.windowMinutes,
        enabled: rule.enabled,
        autoCreateIncident: rule.autoCreateIncident,
        incidentSeverityThreshold: rule.incidentSeverityThreshold,
      },
      create: rule,
    });
  }

  // =========================
  // DEMO AUDIT LOGS
  // =========================
  console.log("Seeding demo audit logs...");

  const now = new Date();
  const demoAuditLogs = [
    { userId: superAdmin.id, event: "AUTH_LOGIN_SUCCESS", module: "auth", ip: "192.168.1.1", metadata: { email: superAdmin.email, loginMethod: "password" } },
    { userId: analyst.id, event: "AUTH_LOGIN_SUCCESS", module: "auth", ip: "192.168.1.2", metadata: { email: analyst.email, loginMethod: "password" } },
    { userId: superAdmin.id, event: "USER_CREATED", module: "users", resourceType: "internal_users", resourceId: analyst.id, metadata: { email: analyst.email } },
    { userId: superAdmin.id, event: "USER_ROLE_ASSIGNED", module: "rbac", resourceType: "user_roles", resourceId: analyst.id, metadata: { roleCode: "SECURITY_ANALYST" } },
    { userId: superAdmin.id, event: "SYSTEM_SETTING_UPDATED", module: "system", resourceType: "system_settings", resourceId: "platform_name", metadata: { key: "platform_name" } },
    { userId: null, event: "AUTH_LOGIN_FAILED", module: "auth", ip: "10.0.0.100", metadata: { email: "unknown@attacker.io", reason: "user_not_found_or_inactive" } },
    { userId: null, event: "AUTH_LOGIN_FAILED", module: "auth", ip: "10.0.0.100", metadata: { email: "admin@solvia.io", reason: "invalid_password" } },
    { userId: analyst.id, event: "SECURITY_ALERT_CREATED", module: "security", resourceType: "security_alerts", metadata: { type: "FAILED_LOGIN_SPIKE", severity: "HIGH" } },
    { userId: superAdmin.id, event: "DASHBOARD_VIEWED", module: "dashboard", metadata: {} },
    { userId: auditor.id, event: "AUTH_LOGIN_SUCCESS", module: "auth", ip: "192.168.1.3", metadata: { email: auditor.email, loginMethod: "password" } },
  ];

  for (let i = 0; i < demoAuditLogs.length; i++) {
    const log = demoAuditLogs[i];
    const createdAt = new Date(now.getTime() - (demoAuditLogs.length - i) * 10 * 60 * 1000);
    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        event: log.event,
        module: log.module,
        ip: (log as { ip?: string }).ip ?? null,
        resourceType: (log as { resourceType?: string }).resourceType ?? null,
        resourceId: (log as { resourceId?: string }).resourceId ?? null,
        metadata: log.metadata,
        createdAt,
      },
    });
  }

  // =========================
  // DEMO SECURITY ALERTS
  // =========================
  console.log("Seeding demo security alerts...");

  const alert1 = await prisma.securityAlert.create({
    data: {
      type: "FAILED_LOGIN_SPIKE",
      severity: "HIGH",
      title: "Failed Login Spike Detected (12 events)",
      description: "12 AUTH_LOGIN_FAILED events detected in the last 15 minutes (threshold: 10)",
      status: "OPEN",
      fingerprint: "a1b2c3d4e5f6a1b2",
      occurrences: 1,
      lastSeenAt: new Date(now.getTime() - 30 * 60 * 1000),
      metadata: {
        triggeringEvent: "AUTH_LOGIN_FAILED",
        eventCount: 12,
        threshold: 10,
        windowMinutes: 15,
        topIp: "10.0.0.100",
      },
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  });

  const alert2 = await prisma.securityAlert.create({
    data: {
      type: "PERMISSION_DENIED_SPIKE",
      severity: "MEDIUM",
      title: "Permission Denied Spike Detected (25 events)",
      description: "25 PERMISSION_DENIED events detected in the last 10 minutes (threshold: 20)",
      status: "INVESTIGATING",
      fingerprint: "b2c3d4e5f6a1b2c3",
      occurrences: 2,
      lastSeenAt: new Date(now.getTime() - 60 * 60 * 1000),
      resolvedByUserId: analyst.id,
      metadata: {
        triggeringEvent: "PERMISSION_DENIED",
        eventCount: 25,
        threshold: 20,
        windowMinutes: 10,
        topUserId: demoUser.id,
      },
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  const alert3 = await prisma.securityAlert.create({
    data: {
      type: "ROLE_ASSIGNMENT_EVENT",
      severity: "MEDIUM",
      title: "Unusual Role Assignment Activity (4 events)",
      description: "4 role assignment events detected in the last 15 minutes (threshold: 3)",
      status: "RESOLVED",
      fingerprint: "c3d4e5f6a1b2c3d4",
      occurrences: 1,
      lastSeenAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
      resolvedByUserId: superAdmin.id,
      resolutionReason: "FALSE_POSITIVE",
      resolutionNotes: "Authorized bulk role assignment during onboarding.",
      metadata: {
        triggeringEvent: "USER_ROLE_ASSIGNED",
        eventCount: 4,
        threshold: 3,
        windowMinutes: 15,
      },
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
  });

  // =========================
  // DEMO INCIDENTS
  // =========================
  console.log("Seeding demo security incidents...");

  await prisma.securityIncident.create({
    data: {
      alertId: alert1.id,
      status: "OPEN",
      assignedTo: analyst.email,
      assignedToUserId: analyst.id,
      notes: "Investigating the source of login failures. Multiple attempts from IP 10.0.0.100.",
      createdAt: new Date(now.getTime() - 25 * 60 * 1000),
    },
  });

  await prisma.securityIncident.create({
    data: {
      alertId: alert2.id,
      status: "INVESTIGATING",
      assignedTo: analyst.email,
      assignedToUserId: analyst.id,
      notes: "Reviewing permission denied events. Appears to be misconfigured service account.",
      createdAt: new Date(now.getTime() - 90 * 60 * 1000),
    },
  });

  await prisma.securityIncident.create({
    data: {
      alertId: alert3.id,
      status: "RESOLVED",
      assignedTo: superAdmin.email,
      assignedToUserId: superAdmin.id,
      notes: "Confirmed false positive. Closed after verification with team lead.",
      resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
  });

  // =========================
  // USER RISK PROFILES
  // =========================
  console.log("Seeding user risk profiles...");

  await prisma.userRiskProfile.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: { userId: superAdmin.id, riskScore: 0, riskLevel: "LOW" },
  });

  await prisma.userRiskProfile.upsert({
    where: { userId: analyst.id },
    update: {},
    create: { userId: analyst.id, riskScore: 8, riskLevel: "LOW" },
  });

  await prisma.userRiskProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: { userId: demoUser.id, riskScore: 35, riskLevel: "MEDIUM" },
  });

  await prisma.userRiskProfile.upsert({
    where: { userId: suspendedUser.id },
    update: {},
    create: { userId: suspendedUser.id, riskScore: 72, riskLevel: "HIGH" },
  });

  console.log("Seed complete!");
  console.log("");
  console.log("Demo accounts:");
  console.log("  Super Admin:       admin@solvia.io     / Admin@Solvia2026!");
  console.log("  Security Analyst:  analyst@solvia.io   / Demo@Solvia2026!");
  console.log("  Auditor:           auditor@solvia.io   / Demo@Solvia2026!");
  console.log("  Demo User:         demo@solvia.io      / Demo@Solvia2026!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
