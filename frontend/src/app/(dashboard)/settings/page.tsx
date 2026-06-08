"use client";

import { useState } from "react";
import {
  SETTING_CATEGORIES,
  SETTING_CATEGORY_LABELS,
  type SettingCategory,
} from "@/types/system-settings";
import { useSystemSettingsByCategory } from "@/hooks/use-system-settings";
import { SettingsCategoryPanel } from "@/components/settings/settings-category-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Palette,
  Shield,
  Wrench,
  Bell,
} from "lucide-react";

const CATEGORY_ICONS: Record<SettingCategory, React.ReactNode> = {
  PLATFORM: <Building2 className="size-4" />,
  BRANDING: <Palette className="size-4" />,
  SECURITY: <Shield className="size-4" />,
  MAINTENANCE: <Wrench className="size-4" />,
  NOTIFICATIONS: <Bell className="size-4" />,
};

export default function SystemSettingsPage() {
  const [activeCategory, setActiveCategory] =
    useState<SettingCategory>("PLATFORM");

  const { data: settings, isLoading } =
    useSystemSettingsByCategory(activeCategory);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform configuration, security policies, and operational
          settings.
        </p>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v as SettingCategory)}
      >
        <TabsList className="w-full justify-start">
          {SETTING_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="gap-1.5 data-[state=active]:shadow-sm"
            >
              {CATEGORY_ICONS[cat]}
              {SETTING_CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        {SETTING_CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <SettingsCategoryPanel
              category={cat}
              settings={
                settings && activeCategory === cat ? settings : []
              }
              isLoading={isLoading && activeCategory === cat}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
