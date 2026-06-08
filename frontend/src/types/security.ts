export type AlertType =
  | "FAILED_LOGIN_SPIKE"
  | "TWO_FACTOR_FAILURE_SPIKE"
  | "PERMISSION_DENIED_SPIKE"
  | "USER_DISABLED_EVENT"
  | "ROLE_ASSIGNMENT_EVENT"
  | "SECURITY_CONFIGURATION_CHANGED";

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  status: AlertStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolvedByUserId: string | null;
  resolvedByEmail: string | null;
  resolutionReason: string | null;
  resolutionNotes: string | null;
}

export interface SecurityIncident {
  id: string;
  alertId: string | null;
  status: IncidentStatus;
  assignedTo: string | null;
  assignedToUserId: string | null;
  assignedToEmail: string | null;
  notes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface RiskBreakdown {
  failedLogins: number;
  twoFactorFailures: number;
  passwordResets: number;
  roleChanges: number;
  accountDisabled: number;
  securityIncidents: number;
}

export interface UserRiskProfile {
  userId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  lastCalculatedAt: string;
  breakdown?: RiskBreakdown;
}

export interface TimelineEntry {
  id: string;
  event: string;
  module: string;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SecurityTimeline {
  userId: string;
  events: TimelineEntry[];
}

export type EngineExecutionStatus = "RUNNING" | "COMPLETED" | "FAILED" | "IDLE";

export interface EngineMetrics {
  lastDetectionRun: string | null;
  lastRiskCalculationRun: string | null;
  alertsCreatedToday: number;
  detectionEngineStatus: EngineExecutionStatus;
  riskEngineStatus: EngineExecutionStatus;
}

export interface SecurityDashboardData {
  openAlerts: number;
  criticalAlerts: number;
  activeIncidents: number;
  highRiskUsers: number;
  failedLoginsToday: number;
  securityEventsToday: number;
  recentAlerts: {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    status: AlertStatus;
    createdAt: string;
  }[];
  engineMetrics: EngineMetrics;
  alertsBySeverity: Record<string, number>;
  alertsByType: Record<string, number>;
  incidentsByStatus: Record<string, number>;
  riskDistribution: Record<string, number>;
  alertsLast24Hours: number;
  alertsLast7Days: number;
}

export interface AlertSearchResponse {
  data: SecurityAlert[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface IncidentSearchResponse {
  data: SecurityIncident[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  LOW: "bg-success-100 text-success-800",
  MEDIUM: "bg-warning-100 text-warning-800",
  HIGH: "bg-error-100 text-error-800",
  CRITICAL: "bg-error-200 text-error-900 font-semibold",
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  OPEN: "bg-error-100 text-error-800",
  INVESTIGATING: "bg-warning-100 text-warning-800",
  RESOLVED: "bg-success-100 text-success-800",
  FALSE_POSITIVE: "bg-muted text-muted-foreground",
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  OPEN: "bg-error-100 text-error-800",
  INVESTIGATING: "bg-warning-100 text-warning-800",
  RESOLVED: "bg-success-100 text-success-800",
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  LOW: "bg-success-100 text-success-800",
  MEDIUM: "bg-warning-100 text-warning-800",
  HIGH: "bg-error-100 text-error-800",
  CRITICAL: "bg-error-200 text-error-900 font-semibold",
};

export const ENGINE_STATUS_COLORS: Record<EngineExecutionStatus, string> = {
  RUNNING: "bg-primary-100 text-primary-800",
  COMPLETED: "bg-success-100 text-success-800",
  FAILED: "bg-error-100 text-error-800",
  IDLE: "bg-muted text-muted-foreground",
};

export interface SecurityRule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  alertType: string;
  severity: AlertSeverity;
  threshold: number;
  windowMinutes: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
