-- CreateEnum
CREATE TYPE "EngineType" AS ENUM ('ALERT_DETECTION', 'RISK_RECALCULATION');

-- CreateEnum
CREATE TYPE "EngineExecutionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "security_engine_executions" (
    "id" TEXT NOT NULL,
    "engine" "EngineType" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "EngineExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "durationMs" INTEGER,
    "alertsCreated" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_engine_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_engine_executions_engine_idx" ON "security_engine_executions"("engine");
CREATE INDEX "security_engine_executions_status_idx" ON "security_engine_executions"("status");
CREATE INDEX "security_engine_executions_startedAt_idx" ON "security_engine_executions"("startedAt");
CREATE INDEX "security_engine_executions_engine_startedAt_idx" ON "security_engine_executions"("engine", "startedAt");