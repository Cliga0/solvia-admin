import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PermissionResolverService } from "./permission-resolver.service";

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionResolver: PermissionResolverService,
  ) {}

  async hasPermission(
    userId: string,
    permissionCode: string,
  ): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    const permissions =
      await this.permissionResolver.getUserPermissions(userId);

    return permissions.includes(permissionCode);
  }

  async hasAnyPermission(
    userId: string,
    permissionCodes: string[],
  ): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    const permissions =
      await this.permissionResolver.getUserPermissions(userId);

    return permissionCodes.some((code) => permissions.includes(code));
  }

  async hasAllPermissions(
    userId: string,
    permissionCodes: string[],
  ): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    const permissions =
      await this.permissionResolver.getUserPermissions(userId);

    return permissionCodes.every((code) => permissions.includes(code));
  }

  private async isSuperAdmin(userId: string): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: {
        userId,
        role: { code: "SUPER_ADMIN" },
      },
    });

    return count > 0;
  }
}
