import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { SettingsValidationService } from "./settings-validation.service";
import { SettingsRedisService } from "./settings-redis.service";
import { AuditEvents, AuditModules } from "@/config";
import { SettingCategory } from "@prisma/client";
import {
  SettingDto,
  PublicSettingDto,
  BulkUpdateSettingsDto,
  BulkUpdateResultDto,
} from "./dto";

const VALID_CATEGORIES = new Set<string>(Object.values(SettingCategory));

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly validationService: SettingsValidationService,
    private readonly redisService: SettingsRedisService,
  ) {}

  async getAll(): Promise<SettingDto[]> {
    const cached = await this.redisService.getCachedAllSettings();
    if (cached) {
      return JSON.parse(cached) as SettingDto[];
    }

    const settings = await this.prisma.systemSetting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    const dtos = settings.map(this.toDto);

    await this.redisService.cacheAllSettings(JSON.stringify(dtos));

    return dtos;
  }

  async getByCategory(category: string): Promise<SettingDto[]> {
    this.assertValidCategory(category);

    const cached = await this.redisService.getCachedCategorySettings(category);
    if (cached) {
      return JSON.parse(cached) as SettingDto[];
    }

    const settings = await this.prisma.systemSetting.findMany({
      where: { category: category as SettingCategory },
      orderBy: { key: "asc" },
    });

    const dtos = settings.map(this.toDto);

    await this.redisService.cacheCategorySettings(
      category,
      JSON.stringify(dtos),
    );

    return dtos;
  }

  async getByKey(key: string): Promise<SettingDto> {
    const setting = await this.prisma.systemSetting.findFirst({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting not found: ${key}`);
    }

    return this.toDto(setting);
  }

  async updateSetting(
    actorUserId: string,
    key: string,
    value: string,
  ): Promise<SettingDto> {
    const setting = await this.prisma.systemSetting.findFirst({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting not found: ${key}`);
    }

    if (!setting.isEditable) {
      throw new BadRequestException(`Setting is not editable: ${key}`);
    }

    this.validationService.validateSetting(
      setting.category,
      key,
      value,
      setting.valueType,
    );

    const oldValue = setting.value;

    const updated = await this.prisma.systemSetting.update({
      where: { id: setting.id },
      data: { value },
    });

    await this.invalidateCache(setting.category);

    this.emitAudit(actorUserId, setting.category, key, oldValue, value);

    this.logger.log(
      `SYSTEM_SETTING_UPDATED key=${key} category=${setting.category}`,
    );

    return this.toDto(updated);
  }

  async bulkUpdate(
    actorUserId: string,
    dto: BulkUpdateSettingsDto,
  ): Promise<BulkUpdateResultDto> {
    const settings: SettingDto[] = [];
    let updatedCount = 0;

    for (const item of dto.items) {
      const setting = await this.prisma.systemSetting.findFirst({
        where: { key: item.key },
      });

      if (!setting) {
        throw new NotFoundException(`Setting not found: ${item.key}`);
      }

      if (!setting.isEditable) {
        throw new BadRequestException(`Setting is not editable: ${item.key}`);
      }

      this.validationService.validateSetting(
        setting.category,
        item.key,
        item.value,
        setting.valueType,
      );
    }

    for (const item of dto.items) {
      const setting = await this.prisma.systemSetting.findFirst({
        where: { key: item.key },
      });

      if (!setting) continue;

      const oldValue = setting.value;

      const updated = await this.prisma.systemSetting.update({
        where: { id: setting.id },
        data: { value: item.value },
      });

      settings.push(this.toDto(updated));
      updatedCount++;

      this.emitAudit(actorUserId, setting.category, item.key, oldValue, item.value);
    }

    await this.redisService.invalidateAll();

    this.auditService.logSafe({
      userId: actorUserId,
      event: AuditEvents.SYSTEM_SETTINGS_BULK_UPDATED,
      module: AuditModules.SYSTEM,
      resourceType: "system_settings",
      metadata: { count: updatedCount },
    });

    this.logger.log(`SYSTEM_SETTINGS_BULK_UPDATED count=${updatedCount}`);

    return { updated: updatedCount, settings };
  }

  async getPublicSettings(): Promise<PublicSettingDto[]> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { isPublic: true },
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    return settings.map((s) => ({
      key: s.key,
      value: s.value,
      valueType: s.valueType,
    }));
  }

  private async invalidateCache(category: string): Promise<void> {
    await Promise.all([
      this.redisService.invalidateAll(),
      this.redisService.invalidateCategory(category),
    ]);
  }

  private emitAudit(
    actorUserId: string,
    category: string,
    key: string,
    oldValue: string,
    newValue: string,
  ): void {
    const event =
      category === "MAINTENANCE" && key === "maintenance_enabled"
        ? newValue === "true"
          ? AuditEvents.MAINTENANCE_MODE_ENABLED
          : AuditEvents.MAINTENANCE_MODE_DISABLED
        : AuditEvents.SYSTEM_SETTING_UPDATED;

    this.auditService.logSafe({
      userId: actorUserId,
      event,
      module: AuditModules.SYSTEM,
      resourceType: "system_settings",
      resourceId: key,
      metadata: {
        category,
        settingKey: key,
        oldValue,
        newValue,
      },
    });
  }

  private assertValidCategory(category: string): void {
    if (!VALID_CATEGORIES.has(category)) {
      throw new BadRequestException(
        `Invalid category: "${category}". Must be one of: ${[...VALID_CATEGORIES].join(", ")}`,
      );
    }
  }

  private toDto(
    setting: Record<string, unknown> & {
      id: string;
      category: string;
      key: string;
      value: string;
      valueType: string;
      description?: string | null;
      isPublic: boolean;
      isEditable: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
  ): SettingDto {
    return {
      id: setting.id,
      category: setting.category,
      key: setting.key,
      value: setting.value,
      valueType: setting.valueType,
      description: setting.description,
      isPublic: setting.isPublic,
      isEditable: setting.isEditable,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}
