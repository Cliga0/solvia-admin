import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthorizationService } from "../authorization.service";
import {
  PERMISSION_METADATA_KEY,
  PERMISSION_MODE_KEY,
} from "./permission-metadata";
import { PermissionMode } from "./permission-mode";

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissions || permissions.length === 0) {
      return true;
    }

    const mode = this.reflector.getAllAndOverride<PermissionMode>(
      PERMISSION_MODE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<{
      user?: { sub: string };
    }>();

    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }

    const userId = request.user.sub;

    let granted: boolean;

    switch (mode) {
      case PermissionMode.ALL:
        granted = await this.authorizationService.hasAllPermissions(
          userId,
          permissions,
        );
        break;
      case PermissionMode.ANY:
        granted = await this.authorizationService.hasAnyPermission(
          userId,
          permissions,
        );
        break;
      default:
        granted = await this.authorizationService.hasPermission(
          userId,
          permissions[0],
        );
        break;
    }

    if (!granted) {
      this.logger.log("PERMISSION_DENIED");
      throw new ForbiddenException();
    }

    this.logger.log("PERMISSION_GRANTED");
    return true;
  }
}
