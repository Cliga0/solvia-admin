import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { RbacService } from "./rbac.service";
import { PermissionsGuard, RequirePermission } from "./guards";
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  AssignPermissionDto,
} from "./dto";

@ApiTags("RBAC")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionsGuard)
@Controller("rbac")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  private getActorId(req: Request): string {
    const user = req.user as { sub: string };
    return user.sub;
  }

  // =========================
  // ROLES
  // =========================

  @Get("roles")
  @RequirePermission("roles.read")
  @ApiOperation({ summary: "List all roles with permissions" })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get("roles/:id")
  @RequirePermission("roles.read")
  @ApiOperation({ summary: "Get role by ID" })
  findRoleById(@Param("id") id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Post("roles")
  @RequirePermission("roles.create")
  @ApiOperation({ summary: "Create a new role" })
  createRole(@Body() dto: CreateRoleDto, @Req() req: Request) {
    return this.rbacService.createRole(this.getActorId(req), dto);
  }

  @Post("roles/:id")
  @RequirePermission("roles.update")
  @ApiOperation({ summary: "Update a role" })
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ) {
    return this.rbacService.updateRole(this.getActorId(req), id, dto);
  }

  @Delete("roles/:id")
  @RequirePermission("roles.delete")
  @ApiOperation({ summary: "Delete a role" })
  deleteRole(@Param("id") id: string, @Req() req: Request) {
    return this.rbacService.deleteRole(this.getActorId(req), id);
  }

  // =========================
  // PERMISSIONS (READ ONLY)
  // =========================

  @Get("permissions")
  @RequirePermission("permissions.read")
  @ApiOperation({ summary: "List all permissions" })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get("permissions/:id")
  @RequirePermission("permissions.read")
  @ApiOperation({ summary: "Get permission by ID" })
  findPermissionById(@Param("id") id: string) {
    return this.rbacService.findPermissionById(id);
  }

  // =========================
  // ASSIGNMENTS
  // =========================

  @Post("roles/permissions")
  @RequirePermission("roles.update")
  @ApiOperation({ summary: "Assign a permission to a role" })
  assignPermissionToRole(
    @Body() dto: AssignPermissionDto,
    @Req() req: Request,
  ) {
    return this.rbacService.assignPermissionToRole(this.getActorId(req), dto);
  }

  @Delete("roles/:roleId/permissions/:permissionId")
  @RequirePermission("roles.update")
  @ApiOperation({ summary: "Remove a permission from a role" })
  removePermissionFromRole(
    @Param("roleId") roleId: string,
    @Param("permissionId") permissionId: string,
    @Req() req: Request,
  ) {
    return this.rbacService.removePermissionFromRole(
      this.getActorId(req),
      roleId,
      permissionId,
    );
  }

  @Post("users/:userId/roles")
  @RequirePermission("users.update")
  @ApiOperation({ summary: "Assign a role to a user" })
  assignRoleToUser(
    @Param("userId") userId: string,
    @Body() dto: AssignRoleDto,
    @Req() req: Request,
  ) {
    return this.rbacService.assignRoleToUser(this.getActorId(req), userId, dto);
  }

  @Delete("users/:userId/roles/:roleId")
  @RequirePermission("users.update")
  @ApiOperation({ summary: "Remove a role from a user" })
  removeRoleFromUser(
    @Param("userId") userId: string,
    @Param("roleId") roleId: string,
    @Req() req: Request,
  ) {
    return this.rbacService.removeRoleFromUser(
      this.getActorId(req),
      userId,
      roleId,
    );
  }

  @Get("users/:userId/permissions")
  @RequirePermission("users.read")
  @ApiOperation({ summary: "Get all permissions for a user" })
  getUserPermissions(@Param("userId") userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }

  @Get("users/:userId/roles")
  @RequirePermission("users.read")
  @ApiOperation({ summary: "Get all roles for a user" })
  getUserRoles(@Param("userId") userId: string) {
    return this.rbacService.getUserRoles(userId);
  }
}
