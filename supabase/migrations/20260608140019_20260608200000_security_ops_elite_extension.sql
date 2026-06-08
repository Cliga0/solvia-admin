-- Part 1: Add fingerprint/occurrences/lastSeenAt to security_alerts
ALTER TABLE "security_alerts"
  ADD COLUMN IF NOT EXISTS "fingerprint" TEXT,
  ADD COLUMN IF NOT EXISTS "occurrences" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "security_alerts_fingerprint_idx" ON "security_alerts"("fingerprint");
CREATE INDEX IF NOT EXISTS "security_alerts_lastSeenAt_idx" ON "security_alerts"("lastSeenAt");

-- Part 2: Add autoCreateIncident / incidentSeverityThreshold to security_rules
ALTER TABLE "security_rules"
  ADD COLUMN IF NOT EXISTS "autoCreateIncident" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "incidentSeverityThreshold" TEXT NOT NULL DEFAULT 'HIGH';

-- Part 3: Create user_risk_histories table
CREATE TABLE IF NOT EXISTS "user_risk_histories" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "riskScore" INTEGER NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "breakdown" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_risk_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_risk_histories_userId_idx" ON "user_risk_histories"("userId");
CREATE INDEX IF NOT EXISTS "user_risk_histories_createdAt_idx" ON "user_risk_histories"("createdAt");
CREATE INDEX IF NOT EXISTS "user_risk_histories_userId_createdAt_idx" ON "user_risk_histories"("userId", "createdAt");

-- Part 4: Create security_rule_histories table
CREATE TABLE IF NOT EXISTS "security_rule_histories" (
  "id" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "previousConfiguration" JSONB NOT NULL,
  "newConfiguration" JSONB NOT NULL,
  "changedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "security_rule_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "security_rule_histories_ruleId_idx" ON "security_rule_histories"("ruleId");
CREATE INDEX IF NOT EXISTS "security_rule_histories_createdAt_idx" ON "security_rule_histories"("createdAt");
CREATE INDEX IF NOT EXISTS "security_rule_histories_ruleId_createdAt_idx" ON "security_rule_histories"("ruleId", "createdAt");

-- Part 5: Create correlation_alerts table
CREATE TABLE IF NOT EXISTS "correlation_alerts" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "sourceAlerts" TEXT[] NOT NULL DEFAULT '{}',
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "correlation_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "correlation_alerts_status_idx" ON "correlation_alerts"("status");
CREATE INDEX IF NOT EXISTS "correlation_alerts_severity_idx" ON "correlation_alerts"("severity");
CREATE INDEX IF NOT EXISTS "correlation_alerts_createdAt_idx" ON "correlation_alerts"("createdAt");
CREATE INDEX IF NOT EXISTS "correlation_alerts_type_idx" ON "correlation_alerts"("type");
