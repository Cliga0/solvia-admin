-- Add ownership columns to security_alerts
ALTER TABLE "security_alerts" ADD COLUMN "resolvedByUserId" TEXT;
ALTER TABLE "security_alerts" ADD COLUMN "resolutionReason" TEXT;
ALTER TABLE "security_alerts" ADD COLUMN "resolutionNotes" TEXT;

-- Add ownership column to security_incidents
ALTER TABLE "security_incidents" ADD COLUMN "assignedToUserId" TEXT;

-- Add foreign keys
ALTER TABLE "security_alerts" ADD CONSTRAINT "security_alerts_resolvedByUserId_fkey"
  FOREIGN KEY ("resolvedByUserId") REFERENCES "internal_users"("id") ON DELETE SET NULL;
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_assignedToUserId_fkey"
  FOREIGN KEY ("assignedToUserId") REFERENCES "internal_users"("id") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX "security_alerts_resolvedByUserId_idx" ON "security_alerts"("resolvedByUserId");
CREATE INDEX "security_incidents_assignedToUserId_idx" ON "security_incidents"("assignedToUserId");

-- CreateTable: security_rules
CREATE TABLE "security_rules" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alertType" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "windowMinutes" INTEGER NOT NULL DEFAULT 15,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "security_rules_code_key" ON "security_rules"("code");
CREATE INDEX "security_rules_alertType_idx" ON "security_rules"("alertType");
CREATE INDEX "security_rules_enabled_idx" ON "security_rules"("enabled");