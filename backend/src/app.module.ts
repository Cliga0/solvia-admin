import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "@/prisma/prisma.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { UsersModule } from "@/modules/users/users.module";
import { appConfig } from "./config";
import { SecurityModule } from "./modules/security/security.module";
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
    PrismaModule,
    EventSystemModule,
    SecurityModule,
    AuthModule,
    AuditModule,
    UsersModule,
  ],
})
export class AppModule {}
