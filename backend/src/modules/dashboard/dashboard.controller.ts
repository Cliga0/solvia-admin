import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { DashboardService } from "./dashboard.service";
import { PermissionsGuard, RequirePermission } from "../rbac/guards";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionsGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @RequirePermission("dashboard.read")
  @ApiOperation({ summary: "Get the operational dashboard" })
  getDashboard(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.dashboardService.getDashboard(user.sub);
  }
}
