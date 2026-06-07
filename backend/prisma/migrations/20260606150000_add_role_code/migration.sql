-- Add Role.code column (nullable first for backfill)
ALTER TABLE "roles" ADD COLUMN "code" TEXT;

-- Backfill: set code = name for all existing rows
UPDATE "roles" SET "code" = "name" WHERE "code" IS NULL;

-- Make code NOT NULL and UNIQUE
ALTER TABLE "roles" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- Drop the unique constraint on name (name is now editable display label)
DROP INDEX IF EXISTS "roles_name_key";
