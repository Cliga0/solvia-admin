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
  ],
  SECURITY_MANAGER: [
    "users.read",
    "users.suspend",
    "roles.read",
    "permissions.read",
    "audit.read",
    "system.settings.read",
  ],
  FINANCE_MANAGER: [
    "users.read",
    "audit.read",
    "system.settings.read",
  ],
  SUPPORT_AGENT: [
    "users.read",
    "audit.read",
  ],
  CONTENT_MANAGER: [
    "users.read",
    "audit.read",
  ],
  ANALYST: [
    "users.read",
    "audit.read",
    "system.settings.read",
  ],
};

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
