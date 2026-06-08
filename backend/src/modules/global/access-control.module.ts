import { Module, Global } from "@nestjs/common";
import { PrismaModule } from "@/prisma/prisma.module";
import { AuthorizationService } from "../rbac/authorization.service";
import { PermissionResolverService } from "../rbac/permission-resolver.service";
import { RbacRedisService } from "../rbac/rbac-redis.service";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuthorizationService,
    PermissionResolverService,
    RbacRedisService,
  ],
  exports: [AuthorizationService, PermissionResolverService, RbacRedisService],
})
export class AccessControlModule {}
