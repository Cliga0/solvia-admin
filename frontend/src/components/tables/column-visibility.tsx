"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Columns3, Eye, EyeOff } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

interface ColumnVisibilityProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
}

export function ColumnVisibility<TData>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  onShowAll,
  onHideAll,
}: ColumnVisibilityProps<TData>) {
  const visibleColumns = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumns = columns.length;

  const toggleableColumns = columns.filter(
    (col) => "accessorKey" in col || "id" in col
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Columns3 className="h-3.5 w-3.5" />
          Columns
          <span className="text-muted-foreground">
            ({visibleColumns}/{totalColumns})
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {toggleableColumns.map((col) => {
          const columnId =
            "accessorKey" in col
              ? String(col.accessorKey)
              : "id" in col
                ? col.id
                : "";

          if (!columnId) return null;

          const header =
            "header" in col && typeof col.header === "string"
              ? col.header
              : columnId;

          return (
            <DropdownMenuCheckboxItem
              key={columnId}
              checked={columnVisibility[columnId] !== false}
              onCheckedChange={(checked) =>
                onColumnVisibilityChange(columnId, checked)
              }
              className="text-xs"
            >
              {header}
            </DropdownMenuCheckboxItem>
          );
        })}
        {(onShowAll || onHideAll) && (
          <>
            <DropdownMenuSeparator />
            <div className="flex gap-1 p-1">
              {onShowAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowAll}
                  className="h-7 flex-1 text-xs"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Show all
                </Button>
              )}
              {onHideAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onHideAll}
                  className="h-7 flex-1 text-xs"
                >
                  <EyeOff className="mr-1 h-3 w-3" />
                  Hide all
                </Button>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
