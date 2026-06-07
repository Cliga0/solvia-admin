-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING', 'ARCHIVED');

-- AlterTable: add status and lastLoginAt columns
ALTER TABLE "internal_users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "internal_users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Backfill: set status based on isActive
UPDATE "internal_users" SET "status" = 'ACTIVE' WHERE "isActive" = true;
UPDATE "internal_users" SET "status" = 'DISABLED' WHERE "isActive" = false;

-- CreateIndex
CREATE INDEX "internal_users_status_idx" ON "internal_users"("status");