import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PermissionsGuard } from "../rbac/guards";
import { AccessControlModule } from "../global/access-control.module";

@Module({
  imports: [AccessControlModule],

  providers: [
    PermissionsGuard,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class SecurityModule {}
