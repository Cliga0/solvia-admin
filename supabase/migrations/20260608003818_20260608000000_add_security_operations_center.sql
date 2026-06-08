-- Create enums
CREATE TYPE "AlertType" AS ENUM ('FAILED_LOGIN_SPIKE', 'TWO_FACTOR_FAILURE_SPIKE', 'PERMISSION_DENIED_SPIKE', 'USER_DISABLED_EVENT', 'ROLE_ASSIGNMENT_EVENT', 'SECURITY_CONFIGURATION_CHANGED');
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable SecurityAlert
CREATE TABLE "security_alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "security_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable SecurityIncident
CREATE TABLE "security_incidents" (
    "id" TEXT NOT NULL,
    "alertId" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserRiskProfile
CREATE TABLE "user_risk_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_risk_profiles_pkey" PRIMARY KEY ("id")
);

-- Indexes for security_alerts
CREATE INDEX "security_alerts_type_idx" ON "security_alerts"("type");
CREATE INDEX "security_alerts_severity_idx" ON "security_alerts"("severity");
CREATE INDEX "security_alerts_status_idx" ON "security_alerts"("status");
CREATE INDEX "security_alerts_createdAt_idx" ON "security_alerts"("createdAt");

-- Indexes for security_incidents
CREATE INDEX "security_incidents_alertId_idx" ON "security_incidents"("alertId");
CREATE INDEX "security_incidents_status_idx" ON "security_incidents"("status");
CREATE INDEX "security_incidents_assignedTo_idx" ON "security_incidents"("assignedTo");
CREATE INDEX "security_incidents_createdAt_idx" ON "security_incidents"("createdAt");

-- Indexes for user_risk_profiles
CREATE UNIQUE INDEX "user_risk_profiles_userId_key" ON "user_risk_profiles"("userId");
CREATE INDEX "user_risk_profiles_userId_idx" ON "user_risk_profiles"("userId");
CREATE INDEX "user_risk_profiles_riskLevel_idx" ON "user_risk_profiles"("riskLevel");
CREATE INDEX "user_risk_profiles_riskScore_idx" ON "user_risk_profiles"("riskScore");

-- Foreign keys
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "security_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new permissions
INSERT INTO "permissions" ("id", "code", "description", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'security.read', 'View security operations center', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'security.alerts.read', 'View security alerts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'security.alerts.manage', 'Manage security alerts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'security.incidents.read', 'View security incidents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'security.incidents.manage', 'Manage security incidents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign new permissions to SUPER_ADMIN
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.code = 'SUPER_ADMIN'
  AND p.code IN ('security.read', 'security.alerts.read', 'security.alerts.manage', 'security.incidents.read', 'security.incidents.manage');

-- Assign security.read + alerts/incidents read to SECURITY_MANAGER
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.code = 'SECURITY_MANAGER'
  AND p.code IN ('security.read', 'security.alerts.read', 'security.alerts.manage', 'security.incidents.read', 'security.incidents.manage');