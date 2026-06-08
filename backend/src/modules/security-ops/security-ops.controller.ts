import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { AlertsService } from "./alerts/alerts.service";
import { IncidentsService } from "./incidents/incidents.service";
import { RiskScoringService } from "./risk/risk-scoring.service";
import { SecurityTimelineService } from "./timeline/security-timeline.service";
import { SecurityDashboardService } from "./monitoring/security-dashboard.service";
import { SecurityMonitoringService } from "./monitoring/security-monitoring.service";
import { PermissionsGuard, RequirePermission } from "../rbac/guards";
import {
  AlertQueryDto,
  UpdateAlertDto,
  IncidentQueryDto,
  CreateIncidentDto,
  UpdateIncidentDto,
} from "./dto";

@ApiTags("Security")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionsGuard)
@Controller("security")
export class SecurityOpsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly incidentsService: IncidentsService,
    private readonly riskScoring: RiskScoringService,
    private readonly timelineService: SecurityTimelineService,
    private readonly dashboardService: SecurityDashboardService,
    private readonly monitoringService: SecurityMonitoringService,
  ) {}

  private getActorId(req: Request): string {
    const user = req.user as { sub: string };
    return user.sub;
  }

  // =========================
  // DASHBOARD
  // =========================

  @Get("dashboard")
  @RequirePermission("security.read")
  @ApiOperation({ summary: "Get the security operations dashboard" })
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  // =========================
  // ALERTS
  // =========================

  @Get("alerts")
  @RequirePermission("security.alerts.read")
  @ApiOperation({ summary: "Search security alerts" })
  searchAlerts(@Query() query: AlertQueryDto) {
    return this.alertsService.search(query);
  }

  @Get("alerts/:id")
  @RequirePermission("security.alerts.read")
  @ApiOperation({ summary: "Get a security alert by ID" })
  findAlertById(@Param("id") id: string) {
    return this.alertsService.findById(id);
  }

  @Patch("alerts/:id")
  @RequirePermission("security.alerts.manage")
  @ApiOperation({ summary: "Update a security alert status" })
  updateAlert(
    @Param("id") id: string,
    @Body() dto: UpdateAlertDto,
    @Req() req: Request,
  ) {
    return this.alertsService.update(this.getActorId(req), id, dto);
  }

  // =========================
  // INCIDENTS
  // =========================

  @Get("incidents")
  @RequirePermission("security.incidents.read")
  @ApiOperation({ summary: "Search security incidents" })
  searchIncidents(@Query() query: IncidentQueryDto) {
    return this.incidentsService.search(query);
  }

  @Post("incidents")
  @RequirePermission("security.incidents.manage")
  @ApiOperation({ summary: "Create a security incident" })
  createIncident(@Body() dto: CreateIncidentDto, @Req() req: Request) {
    return this.incidentsService.create(this.getActorId(req), dto);
  }

  @Patch("incidents/:id")
  @RequirePermission("security.incidents.manage")
  @ApiOperation({ summary: "Update a security incident" })
  updateIncident(
    @Param("id") id: string,
    @Body() dto: UpdateIncidentDto,
    @Req() req: Request,
  ) {
    return this.incidentsService.update(this.getActorId(req), id, dto);
  }

  // =========================
  // USER RISK
  // =========================

  @Get("users/:id/risk")
  @RequirePermission("security.read")
  @ApiOperation({ summary: "Get risk profile for a user" })
  getUserRisk(@Param("id") id: string) {
    return this.riskScoring.getUserRiskProfile(id);
  }

  // =========================
  // USER TIMELINE
  // =========================

  @Get("users/:id/timeline")
  @RequirePermission("security.read")
  @ApiOperation({ summary: "Get security timeline for a user" })
  getUserTimeline(@Param("id") id: string) {
    return this.timelineService.getUserTimeline(id);
  }

  // =========================
  // MONITORING ACTIONS
  // =========================

  @Post("monitoring/detect")
  @RequirePermission("security.alerts.manage")
  @ApiOperation({ summary: "Trigger alert detection cycle" })
  runDetection() {
    return this.monitoringService.runAlertDetection();
  }

  @Post("monitoring/recalculate-risks")
  @RequirePermission("security.alerts.manage")
  @ApiOperation({ summary: "Trigger risk recalculation for all users" })
  recalculateRisks() {
    return this.monitoringService.runRiskRecalculation();
  }
}
