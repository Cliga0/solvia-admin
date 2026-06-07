import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigurationOverviewDto } from "../dto";

const SYSTEM_SETTING_KEYS = [
  "platform_name",
  "support_email",
  "maintenance_enabled",
  "email_enabled",
  "sms_enabled",
  "password_min_length",
  "max_login_attempts",
  "session_timeout",
] as const;

@Injectable()
export class SystemMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<ConfigurationOverviewDto> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: [...SYSTEM_SETTING_KEYS] } },
    });

    const map = new Map<string, string>(
      settings.map((s: { key: string; value: string }) => [s.key, s.value]),
    );

    return {
      platformName: map.get("platform_name") ?? "Solvia",
      supportEmail: map.get("support_email") ?? "",
      maintenanceMode: map.get("maintenance_enabled") === "true",
      notificationsEnabled: map.get("email_enabled") === "true",
      securityProfile: {
        passwordMinLength: parseInt(map.get("password_min_length") ?? "8", 10),
        maxLoginAttempts: parseInt(map.get("max_login_attempts") ?? "10", 10),
        sessionTimeout: parseInt(map.get("session_timeout") ?? "900", 10),
      },
    };
  }
}
