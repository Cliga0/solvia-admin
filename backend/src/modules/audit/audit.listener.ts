import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AuditService } from "./audit.service";
import { AuditEventPayload } from "./audit-event.payload";

@Injectable()
export class AuditListener {
  constructor(private readonly auditService: AuditService) {}

  @OnEvent("role.*")
  async handleRoleEvents(payload: AuditEventPayload) {
    await this.auditService.logSafe(payload);
  }

  @OnEvent("user.role.*")
  async handleUserRoleEvents(payload: AuditEventPayload) {
    await this.auditService.logSafe(payload);
  }
}
