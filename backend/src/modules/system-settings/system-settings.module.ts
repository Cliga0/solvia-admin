import { Module } from "@nestjs/common";
import { SystemSettingsController } from "./system-settings.controller";
import { SystemSettingsService } from "./system-settings.service";
import { SettingsValidationService } from "./settings-validation.service";
import { SettingsRedisService } from "./settings-redis.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [SystemSettingsController],
  providers: [
    SystemSettingsService,
    SettingsValidationService,
    SettingsRedisService,
  ],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
