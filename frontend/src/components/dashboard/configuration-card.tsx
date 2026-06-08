"use client";

import type { ConfigurationOverview } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Mail, Bell, Lock } from "lucide-react";

interface Props {
  data: ConfigurationOverview;
}

export function ConfigurationCard({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="size-4 text-primary-600" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ConfigRow icon={<Settings className="size-3.5" />} label="Platform" value={data.platformName} />
        <ConfigRow icon={<Mail className="size-3.5" />} label="Support Email" value={data.supportEmail} />

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-xs">
            <Bell className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Notifications</span>
          </div>
          <Badge variant={data.notificationsEnabled ? "default" : "secondary"}>
            {data.notificationsEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-xs">
            <Lock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Maintenance</span>
          </div>
          <Badge variant={data.maintenanceMode ? "destructive" : "secondary"}>
            {data.maintenanceMode ? "Active" : "Off"}
          </Badge>
        </div>

        <div className="rounded-md bg-muted/50 p-2 mt-1">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Security Profile</p>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div>
              <p className="font-semibold">{data.securityProfile.passwordMinLength}</p>
              <p className="text-[10px] text-muted-foreground">Min Password</p>
            </div>
            <div>
              <p className="font-semibold">{data.securityProfile.maxLoginAttempts}</p>
              <p className="text-[10px] text-muted-foreground">Max Attempts</p>
            </div>
            <div>
              <p className="font-semibold">{data.securityProfile.sessionTimeout}s</p>
              <p className="text-[10px] text-muted-foreground">Session TTL</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-medium truncate ml-2 max-w-[160px]">{value}</span>
    </div>
  );
}
