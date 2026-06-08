import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_ROLES = [
  { code: "SUPER_ADMIN", name: "Super Administrateur", description: "Full system access across all products" },
  { code: "PLATFORM_ADMIN", name: "Administrateur Plateforme", description: "Platform configuration and management" },
  { code: "SECURITY_MANAGER", name: "Responsable Securite", description: "Security policies, audit logs, and compliance" },
  { code: "FINANCE_MANAGER", name: "Responsable Finance", description: "Financial data, billing, and revenue oversight" },
  { code: "SUPPORT_AGENT", name: "Agent Support", description: "Customer support and ticket management" },
  { code: "CONTENT_MANAGER", name: "Responsable Contenu", description: "Content moderation and publishing" },
  { code: "ANALYST", name: "Analyste", description: "Read-only analytics and reporting" },
] as const;

const SYSTEM_PERMISSIONS = [
  { code: "users.read", description: "View internal users" },
  { code: "users.create", description: "Create internal users" },
  { code: "users.update", description: "Update internal users" },
  { code: "users.delete", description: "Soft-delete internal users" },
  { code: "users.suspend", description: "Suspend and disable internal users" },
  { code: "users.assignRole", description: "Assign roles to users" },
  { code: "roles.read", description: "View roles" },
  { code: "roles.create", description: "Create roles" },
  { code: "roles.update", description: "Update roles" },
  { code: "roles.delete", description: "Delete roles" },
  { code: "permissions.read", description: "View permissions" },
  { code: "audit.read", description: "View audit logs" },
  { code: "system.settings.read", description: "View system settings" },
  { code: "system.settings.update", description: "Update system settings" },
  { code: "dashboard.read", description: "View dashboard" },
  { code: "security.read", description: "View security operations center" },
  { code: "security.alerts.read", description: "View security alerts" },
  { code: "security.alerts.manage", description: "Manage security alerts" },
  { code: "security.incidents.read", description: "View security incidents" },
  { code: "security.incidents.manage", description: "Manage security incidents" },
] as const;

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  SUPER_ADMIN: [
    "users.read",
    "users.create",
    "users.update",
    "users.delete",
    "users.suspend",
    "users.assignRole",
    "roles.read",
    "roles.create",
    "roles.update",
    "roles.delete",
    "permissions.read",
    "audit.read",
    "system.settings.read",
    "system.settings.update",
    "dashboard.read",
    "security.read",
    "security.alerts.read",
    "security.alerts.manage",
    "security.incidents.read",
    "security.incidents.manage",
  ],
  PLATFORM_ADMIN: [
    "users.read",
    "users.create",
    "users.update",
    "users.suspend",
    "users.assignRole",
    "roles.read",
    "permissions.read",
    "system.settings.read",
    "system.settings.update",
    "dashboard.read",
    "security.read",
    "security.alerts.read",
    "security.incidents.read",
  ],
  SECURITY_MANAGER: [
    "users.read",
    "users.suspend",
    "roles.read",
    "permissions.read",
    "audit.read",
    "system.settings.read",
    "dashboard.read",
    "security.read",
    "security.alerts.read",
    "security.alerts.manage",
    "security.incidents.read",
    "security.incidents.manage",
  ],
  FINANCE_MANAGER: [
    "users.read",
    "audit.read",
    "system.settings.read",
    "dashboard.read",
  ],
  SUPPORT_AGENT: [
    "users.read",
    "audit.read",
    "dashboard.read",
  ],
  CONTENT_MANAGER: [
    "users.read",
    "audit.read",
    "dashboard.read",
  ],
  ANALYST: [
    "users.read",
    "audit.read",
    "system.settings.read",
    "dashboard.read",
  ],
};

const DEFAULT_SETTINGS = [
  // PLATFORM
  { category: "PLATFORM", key: "platform_name", value: "Solvia", valueType: "STRING", description: "Platform display name", isPublic: true, isEditable: true },
  { category: "PLATFORM", key: "platform_description", value: "Enterprise administration platform for the Solvia ecosystem", valueType: "STRING", description: "Platform description", isPublic: true, isEditable: true },
  { category: "PLATFORM", key: "support_email", value: "support@solvia.com", valueType: "STRING", description: "Support email address", isPublic: true, isEditable: true },
  { category: "PLATFORM", key: "support_phone", value: "+33 1 00 00 00 00", valueType: "STRING", description: "Support phone number", isPublic: true, isEditable: true },
  { category: "PLATFORM", key: "company_name", value: "Solvia", valueType: "STRING", description: "Legal company name", isPublic: true, isEditable: true },
  // MAINTENANCE
  { category: "MAINTENANCE", key: "maintenance_enabled", value: "false", valueType: "BOOLEAN", description: "Maintenance mode enabled", isPublic: true, isEditable: true },
  { category: "MAINTENANCE", key: "maintenance_message", value: "We are performing scheduled maintenance. Please try again later.", valueType: "STRING", description: "Message displayed during maintenance", isPublic: true, isEditable: true },
  // SECURITY
  { category: "SECURITY", key: "password_min_length", value: "8", valueType: "NUMBER", description: "Minimum password length", isPublic: false, isEditable: true },
  { category: "SECURITY", key: "max_login_attempts", value: "10", valueType: "NUMBER", description: "Maximum login attempts before lockout", isPublic: false, isEditable: true },
  { category: "SECURITY", key: "session_timeout", value: "900", valueType: "NUMBER", description: "Session timeout in seconds", isPublic: false, isEditable: true },
  // NOTIFICATIONS
  { category: "NOTIFICATIONS", key: "email_enabled", value: "true", valueType: "BOOLEAN", description: "Email notifications enabled", isPublic: false, isEditable: true },
  { category: "NOTIFICATIONS", key: "sms_enabled", value: "false", valueType: "BOOLEAN", description: "SMS notifications enabled", isPublic: false, isEditable: true },
] as const;

async function main() {
  console.log("Seeding system roles...");
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });
  }

  console.log("Seeding system permissions...");
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: {
        code: perm.code,
        description: perm.description,
      },
    });
  }

  console.log("Seeding role-permission mappings...");
  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = await prisma.role.findUniqueOrThrow({
      where: { code: roleCode },
    });

    for (const code of permCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { code },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Seeding system settings...");
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: {
        category_key: {
          category: setting.category,
          key: setting.key,
        },
      },
      update: {
        value: setting.value,
        valueType: setting.valueType as any,
        description: setting.description,
        isPublic: setting.isPublic,
        isEditable: setting.isEditable,
      },
      create: {
        category: setting.category as any,
        key: setting.key,
        value: setting.value,
        valueType: setting.valueType as any,
        description: setting.description,
        isPublic: setting.isPublic,
        isEditable: setting.isEditable,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
