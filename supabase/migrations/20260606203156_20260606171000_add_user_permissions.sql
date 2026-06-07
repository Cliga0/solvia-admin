-- Add new permissions
INSERT INTO "permissions" ("id", "code", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'users.suspend', 'Suspend and disable internal users', NOW(), NOW()),
  (gen_random_uuid(), 'users.assignRole', 'Assign roles to users', NOW(), NOW())
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";

-- Add new permissions to SUPER_ADMIN role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), r.id, p.id, NOW(), NOW()
FROM "roles" r, "permissions" p
WHERE r.code = 'SUPER_ADMIN' AND p.code IN ('users.suspend', 'users.assignRole')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Add new permissions to PLATFORM_ADMIN role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), r.id, p.id, NOW(), NOW()
FROM "roles" r, "permissions" p
WHERE r.code = 'PLATFORM_ADMIN' AND p.code IN ('users.suspend', 'users.assignRole')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Add users.suspend to SECURITY_MANAGER role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), r.id, p.id, NOW(), NOW()
FROM "roles" r, "permissions" p
WHERE r.code = 'SECURITY_MANAGER' AND p.code = 'users.suspend'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;