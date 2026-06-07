"use client";

import type { QuickAction } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, UserPlus, FileText, Shield, Settings } from "lucide-react";

const ACTION_ICONS: Record<string, React.ReactNode> = {
  "users.create": <UserPlus className="size-4" />,
  "audit.read": <FileText className="size-4" />,
  "roles.read": <Shield className="size-4" />,
  "system.settings.read": <Settings className="size-4" />,
};

interface Props {
  actions: QuickAction[];
}

export function QuickActionsCard({ actions }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="size-4 text-primary-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <a
            key={action.path}
            href={action.path}
            className="flex items-center gap-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            {ACTION_ICONS[action.permission] ?? <Zap className="size-4" />}
            {action.label}
          </a>
        ))}

        {actions.length === 0 && (
          <p className="text-xs text-muted-foreground">No quick actions available</p>
        )}
      </CardContent>
    </Card>
  );
}
