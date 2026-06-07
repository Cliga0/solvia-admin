import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { PermissionsGuard, RequirePermission } from "../rbac/guards";
import { AuditQueryDto } from "./dto";

@ApiTags("Audit")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionsGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission("audit.read")
  @ApiOperation({ summary: "Search audit logs with filters and pagination" })
  search(@Query() query: AuditQueryDto) {
    return this.auditService.search(query);
  }

  @Get("stats")
  @RequirePermission("audit.read")
  @ApiOperation({ summary: "Get audit statistics" })
  getStats() {
    return this.auditService.getStats();
  }

  @Get(":id")
  @RequirePermission("audit.read")
  @ApiOperation({ summary: "Get a single audit log by ID" })
  findById(@Param("id") id: string) {
    return this.auditService.findById(id);
  }
}
