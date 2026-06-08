import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  AssignPermissionDto,
} from "./dto";

import { AuditEvents, AuditModules } from "@/config";

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // =========================================================
  // ROLE QUERIES
  // =========================================================

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  // =========================================================
  // ROLE COMMANDS
  // =========================================================

  async createRole(actorUserId: string, dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({
      where: { code: dto.code },
    });

    if (exists) {
      throw new ConflictException("Role code already exists");
    }

    const role = await this.prisma.role.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        isSystem: false,
      },
    });

    this.emitEvent("role.created", {
      userId: actorUserId,
      event: AuditEvents.ROLE_CREATED,
      module: AuditModules.ROLES,
      resourceType: "roles",
      resourceId: role.id,
      metadata: { roleCode: dto.code, roleName: dto.name },
    });

    this.logger.log(`ROLE_CREATED: ${dto.code}`);

    return role;
  }

  async updateRole(actorUserId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.getRoleOrFail(id);

    this.assertNotSystemRole(role);

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    this.emitEvent("role.updated", {
      userId: actorUserId,
      event: AuditEvents.ROLE_UPDATED,
      module: AuditModules.ROLES,
      resourceType: "roles",
      resourceId: id,
      metadata: {
        roleCode: role.code,
        changes: dto,
      },
    });

    return updated;
  }

  async deleteRole(actorUserId: string, id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    this.assertNotSystemRole(role);

    if (role._count.users > 0) {
      throw new BadRequestException("Role is assigned to users");
    }

    await this.prisma.role.delete({ where: { id } });

    this.emitEvent("role.deleted", {
      userId: actorUserId,
      event: AuditEvents.ROLE_DELETED,
      module: AuditModules.ROLES,
      resourceType: "roles",
      resourceId: id,
      metadata: { roleCode: role.code },
    });

    this.logger.log(`ROLE_DELETED: ${role.code}`);
  }

  // =========================================================
  // PERMISSIONS
  // =========================================================

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { code: "asc" },
    });
  }

  async findPermissionById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    return permission;
  }

  // =========================================================
  // ROLE → PERMISSION
  // =========================================================

  async assignPermissionToRole(actorUserId: string, dto: AssignPermissionDto) {
    const role = await this.getRoleOrFail(dto.roleId);
    const permission = await this.getPermissionOrFail(dto.permissionId);

    const result = await this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: dto.roleId,
          permissionId: dto.permissionId,
        },
      },
      update: {},
      create: {
        roleId: dto.roleId,
        permissionId: dto.permissionId,
      },
    });

    this.emitEvent("role.permission.assigned", {
      userId: actorUserId,
      event: AuditEvents.ROLE_PERMISSION_ASSIGNED,
      module: AuditModules.RBAC,
      resourceType: "roles",
      resourceId: dto.roleId,
      metadata: {
        roleCode: role.code,
        permissionCode: permission.code,
      },
    });

    return result;
  }

  async removePermissionFromRole(
    actorUserId: string,
    roleId: string,
    permissionId: string,
  ) {
    const role = await this.getRoleOrFail(roleId);
    this.assertNotSystemRole(role);

    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    await this.prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });

    this.emitEvent("role.permission.removed", {
      userId: actorUserId,
      event: AuditEvents.ROLE_PERMISSION_REMOVED,
      module: AuditModules.RBAC,
      resourceType: "roles",
      resourceId: roleId,
      metadata: {
        roleCode: role.code,
        permissionCode: permission?.code ?? "unknown",
      },
    });
  }

  // =========================================================
  // USER → ROLE
  // =========================================================

  async assignRoleToUser(
    actorUserId: string,
    targetUserId: string,
    dto: AssignRoleDto,
  ) {
    const role = await this.getRoleOrFail(dto.roleId);

    const result = await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: targetUserId,
          roleId: dto.roleId,
        },
      },
      update: {},
      create: {
        userId: targetUserId,
        roleId: dto.roleId,
      },
    });

    this.emitEvent("user.role.assigned", {
      userId: actorUserId,
      event: AuditEvents.USER_ROLE_ASSIGNED,
      module: AuditModules.RBAC,
      resourceType: "internal_users",
      resourceId: targetUserId,
      metadata: {
        targetUserId,
        roleCode: role.code,
      },
    });

    return result;
  }

  async removeRoleFromUser(
    actorUserId: string,
    targetUserId: string,
    roleId: string,
  ) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    await this.prisma.userRole.deleteMany({
      where: { userId: targetUserId, roleId },
    });

    this.emitEvent("user.role.removed", {
      userId: actorUserId,
      event: AuditEvents.USER_ROLE_REMOVED,
      module: AuditModules.RBAC,
      resourceType: "internal_users",
      resourceId: targetUserId,
      metadata: {
        targetUserId,
        roleCode: role?.code ?? "unknown",
      },
    });
  }

  // =========================================================
  // USER PERMISSIONS (READ MODEL)
  // =========================================================

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      for (const rp of userRole.role.permissions) {
        permissions.add(rp.permission.code);
      }
    }

    return [...permissions];
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  // =========================================================
  // PRIVATE HELPERS
  // =========================================================

  private async getRoleOrFail(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  private async getPermissionOrFail(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    return permission;
  }

  private assertNotSystemRole(role: any) {
    if (role.isSystem) {
      throw new BadRequestException("System role cannot be modified");
    }
  }

  private emitEvent(event: string, payload: any) {
    this.eventEmitter.emit(event, payload);
  }
}
