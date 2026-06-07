import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { SystemSettingsService } from "./system-settings.service";
import { PermissionsGuard, RequirePermission } from "../rbac/guards";
import {
  UpdateSettingDto,
  BulkUpdateSettingsDto,
} from "./dto";

@ApiTags("System Settings")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionsGuard)
@Controller("system/settings")
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  private getActorId(req: Request): string {
    const user = req.user as { sub: string };
    return user.sub;
  }

  @Get()
  @RequirePermission("system.settings.read")
  @ApiOperation({ summary: "Get all system settings" })
  getAll() {
    return this.settingsService.getAll();
  }

  @Get("public")
  @ApiOperation({ summary: "Get public settings (no auth required)" })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get("category/:category")
  @RequirePermission("system.settings.read")
  @ApiOperation({ summary: "Get settings by category" })
  getByCategory(@Param("category") category: string) {
    return this.settingsService.getByCategory(category);
  }

  @Get(":key")
  @RequirePermission("system.settings.read")
  @ApiOperation({ summary: "Get a single setting by key" })
  getByKey(@Param("key") key: string) {
    return this.settingsService.getByKey(key);
  }

  @Patch(":key")
  @RequirePermission("system.settings.update")
  @ApiOperation({ summary: "Update a single setting" })
  updateSetting(
    @Param("key") key: string,
    @Body() dto: UpdateSettingDto,
    @Req() req: Request,
  ) {
    return this.settingsService.updateSetting(
      this.getActorId(req),
      key,
      dto.value,
    );
  }

  @Patch()
  @RequirePermission("system.settings.update")
  @ApiOperation({ summary: "Bulk update multiple settings" })
  bulkUpdate(@Body() dto: BulkUpdateSettingsDto, @Req() req: Request) {
    return this.settingsService.bulkUpdate(this.getActorId(req), dto);
  }
}
