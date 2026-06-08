"use client";

import { SystemSetting, SettingCategory } from "@/types/system-settings";
import { useUpdateSystemSetting } from "@/hooks/use-system-settings";
import { SettingField } from "./setting-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SettingsCategoryPanelProps {
  category: SettingCategory;
  settings: SystemSetting[];
  isLoading: boolean;
}

export function SettingsCategoryPanel({
  category,
  settings,
  isLoading,
}: SettingsCategoryPanelProps) {
  const updateMutation = useUpdateSystemSetting();

  const handleSave = async (key: string, value: string): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ key, value });
      toast.success("Setting updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update setting",
      );
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-9 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (settings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No settings in this category.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{category}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {settings.length} setting{settings.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {settings.map((setting) => (
          <SettingField
            key={setting.id}
            setting={setting}
            onSave={handleSave}
          />
        ))}
      </CardContent>
    </Card>
  );
}
