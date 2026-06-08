import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuthRedisService } from "../auth/auth-redis.service";
import { AuditEvents, AuditModules } from "@/config";
import { UserStatus } from "./types";
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserDto,
  UserDetailsDto,
  UserSearchResponseDto,
  UserPaginationDto,
  UserSecurityProfileDto,
  AssignRoleDto,
  LifecycleActionDto,
} from "./dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly redisService: AuthRedisService,
  ) {}

  // =========================
  // CRUD
  // =========================

  async createUser(actorUserId: string, dto: CreateUserDto): Promise<UserDto> {
    const existing = await this.prisma.internalUser.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.internalUser.create({
      data: {
        email: dto.email,
        passwordHash,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
    });

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_CREATED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: user.id,
      metadata: { targetUserId: user.id, email: user.email },
    });

    return this.toUserDto(user);
  }

  async findAll(query: UserQueryDto): Promise<UserSearchResponseDto> {
    const where = this.buildWhere(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const sortDirection = query.sortDirection ?? "desc";

    const [items, total] = await Promise.all([
      this.prisma.internalUser.findMany({
        where,
        orderBy: { createdAt: sortDirection },
        skip: (page - 1) * limit,
        take: limit,
        include: query.roleCode
          ? { roles: { include: { role: true } } }
          : undefined,
      }),
      this.prisma.internalUser.count({ where }),
    ]);

    const pagination: UserPaginationDto = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return {
      data: items.map((item) => this.toUserDto(item)),
      pagination,
    };
  }

  async findById(id: string): Promise<UserDetailsDto> {
    const user = await this.prisma.internalUser.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.toUserDetailsDto(user);
  }

  async updateUser(
    actorUserId: string,
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserDto> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.internalUser.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        throw new ConflictException("Email already in use");
      }
    }

    const updated = await this.prisma.internalUser.update({
      where: { id },
      data: { email: dto.email },
    });

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_UPDATED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, changes: { email: dto.email } },
    });

    return this.toUserDto(updated);
  }

  // =========================
  // LIFECYCLE
  // =========================

  async suspendUser(
    actorUserId: string,
    id: string,
    dto: LifecycleActionDto,
  ): Promise<UserDto> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new BadRequestException("User is already suspended");
    }

    const updated = await this.prisma.internalUser.update({
      where: { id },
      data: { status: UserStatus.SUSPENDED, isActive: false },
    });

    await this.doRevokeAllSessions(id);

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_SUSPENDED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, reason: dto.reason },
    });

    return this.toUserDto(updated);
  }

  async activateUser(actorUserId: string, id: string): Promise<UserDto> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException("User is already active");
    }

    const updated = await this.prisma.internalUser.update({
      where: { id },
      data: { status: UserStatus.ACTIVE, isActive: true },
    });

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_REACTIVATED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, previousStatus: user.status },
    });

    return this.toUserDto(updated);
  }

  async disableUser(
    actorUserId: string,
    id: string,
    dto: LifecycleActionDto,
  ): Promise<UserDto> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status === UserStatus.DISABLED) {
      throw new BadRequestException("User is already disabled");
    }

    const updated = await this.prisma.internalUser.update({
      where: { id },
      data: { status: UserStatus.DISABLED, isActive: false },
    });

    await this.doRevokeAllSessions(id);

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_DISABLED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, reason: dto.reason },
    });

    return this.toUserDto(updated);
  }

  async archiveUser(
    actorUserId: string,
    id: string,
    dto: LifecycleActionDto,
  ): Promise<UserDto> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status === UserStatus.ARCHIVED) {
      throw new BadRequestException("User is already archived");
    }

    const updated = await this.prisma.internalUser.update({
      where: { id },
      data: { status: UserStatus.ARCHIVED, isActive: false },
    });

    await this.doRevokeAllSessions(id);

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_ARCHIVED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, reason: dto.reason },
    });

    return this.toUserDto(updated);
  }

  // =========================
  // SECURITY CONTROL
  // =========================

  async forceLogout(
    actorUserId: string,
    id: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.doRevokeAllSessions(id);

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_SESSION_REVOKED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, action: "force_logout" },
    });

    return { message: "All sessions revoked" };
  }

  async revokeAllSessions(
    actorUserId: string,
    id: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.doRevokeAllSessions(id);

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_SESSION_REVOKED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, action: "revoke_all_sessions" },
    });

    return { message: "All sessions revoked" };
  }

  async adminResetPassword(
    actorUserId: string,
    id: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.prisma.internalUser.update({
      where: { id },
      data: { passwordHash },
    });

    await this.doRevokeAllSessions(id);

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_PASSWORD_RESET_ADMIN,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id },
    });

    return { message: "Password reset successfully" };
  }

  async adminDisable2FA(
    actorUserId: string,
    id: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.internalUser.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException("2FA is not enabled for this user");
    }

    await this.prisma.internalUser.update({
      where: { id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
      },
    });

    await this.prisma.backupCode.deleteMany({ where: { userId: id } });

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.TWO_FACTOR_DISABLED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: id,
      metadata: { targetUserId: id, action: "admin_override" },
    });

    return { message: "2FA disabled by admin" };
  }

  // =========================
  // RBAC INTEGRATION
  // =========================

  async assignRole(
    actorUserId: string,
    targetUserId: string,
    dto: AssignRoleDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.internalUser.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    await this.prisma.userRole.upsert({
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

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_ROLE_ASSIGNED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: targetUserId,
      metadata: { targetUserId, roleCode: role.code },
    });

    return { message: "Role assigned" };
  }

  async removeRole(
    actorUserId: string,
    targetUserId: string,
    roleId: string,
  ): Promise<{ message: string }> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: targetUserId, roleId },
    });

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.USER_ROLE_REMOVED,
      module: AuditModules.USERS,
      resourceType: "internal_users",
      resourceId: targetUserId,
      metadata: { targetUserId, roleCode: role.code },
    });

    return { message: "Role removed" };
  }

  async getUserRoles(targetUserId: string) {
    const user = await this.prisma.internalUser.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.userRole.findMany({
      where: { userId: targetUserId },
      include: { role: true },
    });
  }

  async getUserPermissions(targetUserId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: targetUserId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    const codes = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        codes.add(rp.permission.code);
      }
    }
    return [...codes];
  }

  // =========================
  // SECURITY PROFILE
  // =========================

  async getSecurityProfile(id: string): Promise<UserSecurityProfileDto> {
    const user = await this.prisma.internalUser.findUnique({
      where: { id },
      include: {
        sessions: {
          where: { isRevoked: false },
          orderBy: { lastActiveAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorEnabledAt: user.twoFactorEnabledAt,
      lastLoginAt: user.lastLoginAt,
      activeSessions: user.sessions.map((s) => ({
        id: s.id,
        ip: s.ip,
        userAgent: s.userAgent,
        loginAt: s.loginAt,
        logoutAt: s.logoutAt,
        lastActiveAt: s.lastActiveAt,
        isRevoked: s.isRevoked,
      })),
    };
  }

  // =========================
  // PRIVATE HELPERS
  // =========================

  private async doRevokeAllSessions(userId: string): Promise<void> {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, isRevoked: false },
    });

    for (const session of sessions) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { isRevoked: true, logoutAt: new Date() },
      });

      if (session.refreshTokenHash) {
        await this.redisService.blacklistToken(session.refreshTokenHash);
      }

      await this.redisService.invalidateSessionCache(session.id);
      await this.redisService.removeUserSession(userId, session.id);
    }
  }

  private buildWhere(query: UserQueryDto): Record<string, unknown> {
    const conditions: Record<string, unknown> = {};

    if (query.email) {
      conditions.email = { contains: query.email, mode: "insensitive" };
    }

    if (query.status) {
      conditions.status = query.status;
    }

    if (query.createdFrom || query.createdTo) {
      conditions.createdAt = {
        ...(query.createdFrom ? { gte: new Date(query.createdFrom) } : {}),
        ...(query.createdTo ? { lte: new Date(query.createdTo) } : {}),
      };
    }

    if (query.roleCode) {
      conditions.roles = {
        some: {
          role: { code: query.roleCode },
        },
      };
    }

    return conditions;
  }

  private toUserDto(
    user: Record<string, unknown> & {
      id: string;
      email: string;
      status: string;
      isActive: boolean;
      twoFactorEnabled: boolean;
      twoFactorEnabledAt?: Date | null;
      lastLoginAt?: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
  ): UserDto {
    return {
      id: user.id,
      email: user.email,
      status: user.status as UserStatus,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorEnabledAt: user.twoFactorEnabledAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toUserDetailsDto(
    user: Record<string, unknown> & {
      id: string;
      email: string;
      status: string;
      isActive: boolean;
      twoFactorEnabled: boolean;
      twoFactorEnabledAt?: Date | null;
      lastLoginAt?: Date | null;
      createdAt: Date;
      updatedAt: Date;
      roles: Array<{
        id: string;
        assignedAt: Date;
        role: { id: string; code: string; name: string };
      }>;
    },
  ): UserDetailsDto {
    return {
      id: user.id,
      email: user.email,
      status: user.status as UserStatus,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorEnabledAt: user.twoFactorEnabledAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        code: ur.role.code,
        name: ur.role.name,
        assignedAt: ur.assignedAt,
      })),
    };
  }
}
