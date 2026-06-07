import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { UsersService } from "./users.service";
import { PermissionsGuard, RequirePermission } from "../rbac/guards";
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  LifecycleActionDto,
  AssignRoleDto,
} from "./dto";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getActorId(req: Request): string {
    const user = req.user as { sub: string };
    return user.sub;
  }

  // =========================
  // CRUD
  // =========================

  @Get()
  @RequirePermission("users.read")
  @ApiOperation({ summary: "List users with filters and pagination" })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @RequirePermission("users.read")
  @ApiOperation({ summary: "Get user details by ID" })
  findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @RequirePermission("users.create")
  @ApiOperation({ summary: "Create a new internal user" })
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    return this.usersService.createUser(this.getActorId(req), dto);
  }

  @Post(":id")
  @RequirePermission("users.update")
  @ApiOperation({ summary: "Update user profile" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.usersService.updateUser(this.getActorId(req), id, dto);
  }

  // =========================
  // LIFECYCLE
  // =========================

  @Post(":id/suspend")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Suspend a user" })
  suspend(
    @Param("id") id: string,
    @Body() dto: LifecycleActionDto,
    @Req() req: Request,
  ) {
    return this.usersService.suspendUser(this.getActorId(req), id, dto);
  }

  @Post(":id/activate")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Activate a suspended or disabled user" })
  activate(@Param("id") id: string, @Req() req: Request) {
    return this.usersService.activateUser(this.getActorId(req), id);
  }

  @Post(":id/disable")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Disable a user" })
  disable(
    @Param("id") id: string,
    @Body() dto: LifecycleActionDto,
    @Req() req: Request,
  ) {
    return this.usersService.disableUser(this.getActorId(req), id, dto);
  }

  @Post(":id/archive")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Archive a user" })
  archive(
    @Param("id") id: string,
    @Body() dto: LifecycleActionDto,
    @Req() req: Request,
  ) {
    return this.usersService.archiveUser(this.getActorId(req), id, dto);
  }

  // =========================
  // SECURITY CONTROL
  // =========================

  @Post(":id/force-logout")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Force logout all sessions for a user" })
  forceLogout(@Param("id") id: string, @Req() req: Request) {
    return this.usersService.forceLogout(this.getActorId(req), id);
  }

  @Post(":id/revoke-sessions")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Revoke all sessions for a user" })
  revokeSessions(@Param("id") id: string, @Req() req: Request) {
    return this.usersService.revokeAllSessions(this.getActorId(req), id);
  }

  @Post(":id/reset-password")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Admin reset password for a user" })
  adminResetPassword(
    @Param("id") id: string,
    @Body() body: { password: string },
    @Req() req: Request,
  ) {
    return this.usersService.adminResetPassword(
      this.getActorId(req),
      id,
      body.password,
    );
  }

  @Post(":id/disable-2fa")
  @RequirePermission("users.suspend")
  @ApiOperation({ summary: "Admin override: disable 2FA for a user" })
  adminDisable2FA(@Param("id") id: string, @Req() req: Request) {
    return this.usersService.adminDisable2FA(this.getActorId(req), id);
  }

  // =========================
  // RBAC INTEGRATION
  // =========================

  @Post(":id/roles")
  @RequirePermission("users.assignRole")
  @ApiOperation({ summary: "Assign a role to a user" })
  assignRole(
    @Param("id") id: string,
    @Body() dto: AssignRoleDto,
    @Req() req: Request,
  ) {
    return this.usersService.assignRole(this.getActorId(req), id, dto);
  }

  @Delete(":id/roles/:roleId")
  @RequirePermission("users.assignRole")
  @ApiOperation({ summary: "Remove a role from a user" })
  removeRole(
    @Param("id") id: string,
    @Param("roleId") roleId: string,
    @Req() req: Request,
  ) {
    return this.usersService.removeRole(this.getActorId(req), id, roleId);
  }

  @Get(":id/roles")
  @RequirePermission("users.read")
  @ApiOperation({ summary: "Get roles for a user" })
  getUserRoles(@Param("id") id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Get(":id/permissions")
  @RequirePermission("users.read")
  @ApiOperation({ summary: "Get permissions for a user" })
  getUserPermissions(@Param("id") id: string) {
    return this.usersService.getUserPermissions(id);
  }

  // =========================
  // SECURITY PROFILE
  // =========================

  @Get(":id/security-profile")
  @RequirePermission("users.read")
  @ApiOperation({ summary: "Get security profile for a user" })
  getSecurityProfile(@Param("id") id: string) {
    return this.usersService.getSecurityProfile(id);
  }
}
