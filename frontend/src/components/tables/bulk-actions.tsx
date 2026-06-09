"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: () => void;
  disabled?: boolean;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection?: () => void;
  className?: string;
}

export function BulkActions({
  selectedCount,
  actions,
  onClearSelection,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  const primaryActions = actions.filter((a) => a.variant !== "destructive");
  const destructiveActions = actions.filter(
    (a) => a.variant === "destructive"
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2",
        className
      )}
    >
      <span className="text-xs font-medium">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-1">
        {primaryActions.slice(0, 3).map((action) => (
          <Button
            key={action.key}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="h-7 gap-1.5 text-xs"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}

        {(primaryActions.length > 3 || destructiveActions.length > 0) && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {primaryActions.length > 3 && (
                <>
                  <DropdownMenuLabel className="text-xs">
                    Actions
                  </DropdownMenuLabel>
                  {primaryActions.slice(3).map((action) => (
                    <DropdownMenuItem
                      key={action.key}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className="text-xs"
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {destructiveActions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-destructive">
                    Danger zone
                  </DropdownMenuLabel>
                  {destructiveActions.map((action) => (
                    <DropdownMenuItem
                      key={action.key}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className="text-xs text-destructive focus:text-destructive"
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {onClearSelection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 w-7 p-0 ml-auto"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
