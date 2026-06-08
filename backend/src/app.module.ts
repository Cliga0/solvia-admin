import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/prisma/prisma.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { UsersModule } from "@/modules/users/users.module";
import { SystemSettingsModule } from "@/modules/system-settings/system-settings.module";
import { DashboardModule } from "@/modules/dashboard/dashboard.module";
import { appConfig } from "./config";
import { SecurityModule } from "./modules/security/security.module";
import { SecurityOpsModule } from "./modules/security-ops/security-ops.module";
import { EventSystemModule } from "./modules/event/event-system.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ["../.env", ".env"],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow<number>("app.throttle.ttl"),
          limit: config.getOrThrow<number>("app.throttle.limit"),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EventSystemModule,
    SecurityModule,
    SecurityOpsModule,
    AuthModule,
    AuditModule,
    UsersModule,
    SystemSettingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
