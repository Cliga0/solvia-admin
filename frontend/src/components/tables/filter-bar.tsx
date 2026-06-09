"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  type: "text" | "select" | "date" | "daterange";
  label: string;
  placeholder?: string;
  options?: FilterOption[];
}

interface FilterBarProps {
  filters: Record<string, string | undefined>;
  filterConfigs: FilterConfig[];
  onFilterChange: (key: string, value: string | undefined) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  filterConfigs,
  onFilterChange,
  onClearAll,
  className,
}: FilterBarProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filterConfigs.map((config) => {
        const value = filters[config.key];

        switch (config.type) {
          case "text":
            return (
              <div key={config.key} className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={config.placeholder || config.label}
                  value={value || ""}
                  onChange={(e) =>
                    onFilterChange(
                      config.key,
                      e.target.value || undefined
                    )
                  }
                  className="h-8 w-[200px] pl-8 text-xs"
                />
              </div>
            );

          case "select":
            return (
              <Select
                key={config.key}
                value={value || ""}
                onValueChange={(v) =>
                  onFilterChange(config.key, v || undefined)
                }
              >
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue
                    placeholder={config.placeholder || config.label}
                  />
                </SelectTrigger>
                <SelectContent>
                  {config.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

          case "date":
            return (
              <Input
                key={config.key}
                type="date"
                placeholder={config.placeholder || config.label}
                value={value || ""}
                onChange={(e) =>
                  onFilterChange(config.key, e.target.value || undefined)
                }
                className="h-8 w-[160px] text-xs"
              />
            );

          default:
            return null;
        }
      })}

      {activeFiltersCount > 0 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          Clear filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}
