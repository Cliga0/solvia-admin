import { Module } from "@nestjs/common";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";
import { PermissionResolverService } from "./permission-resolver.service";
import { RbacRedisService } from "./rbac-redis.service";
import { AuthorizationService } from "./authorization.service";

@Module({
  controllers: [RbacController],

  providers: [
    RbacService,
    RbacRedisService,
    PermissionResolverService,
    AuthorizationService,
  ],

  exports: [RbacService, PermissionResolverService, AuthorizationService],
})
export class RbacModule {}
