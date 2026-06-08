# RBAC Governance

Version: 1.0

## Role Architecture

### Role.code

- Immutable technical identifier
- Unique across the system
- Used by all programmatic logic (authorization checks, seed lookups, foreign key references)
- Set once at creation time, never updated
- Convention: UPPER_SNAKE_CASE (e.g., `SUPER_ADMIN`, `SECURITY_MANAGER`)

### Role.name

- Human-readable display label
- Editable after creation
- Used for UI presentation only
- Never used for authorization logic or database lookups
- Can be localized (e.g., `Super Administrateur`, `Responsable Securite`)

### System Roles

System roles (`isSystem = true`) have additional restrictions:

- Cannot be deleted
- Cannot have their `code` modified
- Cannot have their permission assignments removed via API (system role permissions are managed via seed/migrations only)
- Display `name` can be updated for localization purposes

### Current System Roles

| code | name | Description |
|---|---|---|
| SUPER_ADMIN | Super Administrateur | Full system access across all products |
| PLATFORM_ADMIN | Administrateur Plateforme | Platform configuration and management |
| SECURITY_MANAGER | Responsable Securite | Security policies, audit logs, and compliance |
| FINANCE_MANAGER | Responsable Finance | Financial data, billing, and revenue oversight |
| SUPPORT_AGENT | Agent Support | Customer support and ticket management |
| CONTENT_MANAGER | Responsable Contenu | Content moderation and publishing |
| ANALYST | Analyste | Read-only analytics and reporting |

## Permission Governance

### Core Principle

Permissions are version-controlled code. They are not runtime data.

### Management Rules

Permissions MUST be managed exclusively through:

- Prisma seed files
- Database migrations
- Git version control

### Forbidden Operations

- Runtime permission creation via API is forbidden
- Runtime permission deletion via API is forbidden
- The `createPermission` and `deletePermission` endpoints have been removed

### Allowed Operations

- Read permission lists (`permissions.read`)
- View individual permissions
- Assign existing permissions to roles
- Remove permissions from roles (non-system roles only)

### Permission Naming Convention

Format: `resource.action`

Examples:

- `users.read`
- `users.create`
- `roles.update`
- `audit.read`
- `system.settings.update`

### Current Permissions

| code | Description |
|---|---|
| users.read | View internal users |
| users.create | Create internal users |
| users.update | Update internal users |
| users.delete | Soft-delete internal users |
| roles.read | View roles |
| roles.create | Create roles |
| roles.update | Update roles |
| roles.delete | Delete roles |
| permissions.read | View permissions |
| audit.read | View audit logs |
| system.settings.read | View system settings |
| system.settings.update | Update system settings |

## Adding New Permissions

1. Add the permission to `SYSTEM_PERMISSIONS` in `prisma/seed.ts`
2. Add the permission to the relevant role(s) in `ROLE_PERMISSION_MAP`
3. Add the `@RequirePermission(...)` decorator to the target controller endpoint
4. Run `prisma migrate dev` and `prisma db seed`
5. Commit all changes to Git

## Adding New Roles

1. Add the role definition to `SYSTEM_ROLES` in `prisma/seed.ts` with both `code` and `name`
2. Add the role's permission mappings to `ROLE_PERMISSION_MAP`
3. Run `prisma migrate dev` and `prisma db seed`
4. Commit all changes to Git

Non-system roles can also be created at runtime via the `POST /rbac/roles` endpoint. Runtime-created roles:
- Have `isSystem = false`
- Can be modified and deleted
- Must have a unique `code`
- Can have their `name` updated

## Migration Guidance

### From Role.name to Role.code

If upgrading from a version where `Role.name` was used as both identifier and label:

1. Apply migration `20260606150000_add_role_code`
2. This adds `code` column, backfills `code = name`, and drops the unique constraint on `name`
3. All programmatic lookups now use `code` instead of `name`
4. The `name` field is now free for localization/editing

### Future: Permission.isSystem

Consider adding a `Permission.isSystem` boolean column to distinguish seed-managed permissions from any future runtime-created permissions. This would enable:
- Preventing deletion of system permissions
- Clear audit trail of permission origin
