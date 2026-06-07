export interface AuditEventPayload {
  userId: string;
  event: string;
  module: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}
