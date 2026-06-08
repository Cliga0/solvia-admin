import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { RbacRedisService } from "./rbac-redis.service";

@Injectable()
export class PermissionResolverService {
  private readonly logger = new Logger(PermissionResolverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RbacRedisService,
  ) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const cached = await this.redisService.getCachedPermissions(userId);

    if (cached) {
      this.logger.log("PERMISSIONS_CACHE_HIT");
      return cached;
    }

    this.logger.log("PERMISSIONS_CACHE_MISS");

    const permissions = await this.resolveFromDatabase(userId);

    await this.redisService.setCachedPermissions(userId, permissions);

    this.logger.log(`PERMISSIONS_RESOLVED count=${permissions.length}`);

    return permissions;
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.redisService.invalidateCachedPermissions(userId);
  }

  private async resolveFromDatabase(userId: string): Promise<string[]> {
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

    const codes = new Set<string>();

    for (const userRole of userRoles) {
      for (const rp of userRole.role.permissions) {
        codes.add(rp.permission.code);
      }
    }

    return [...codes];
  }
}
