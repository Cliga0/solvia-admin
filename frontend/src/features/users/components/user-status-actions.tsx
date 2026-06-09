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
import { MoveHorizontal as MoreHorizontal, UserCheck, UserX, Ban, RotateCcw, Trash2 } from "lucide-react";
import type { UserStatus } from "../types";

interface UserStatusActionsProps {
  userId: string;
  status: UserStatus;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onSuspend?: () => void;
  onUnsuspend?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function UserStatusActions({
  userId: _userId,
  status,
  onActivate,
  onDeactivate,
  onSuspend,
  onUnsuspend,
  onDelete,
  className,
}: UserStatusActionsProps) {
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {status !== "ACTIVE" && onActivate && (
            <DropdownMenuItem onClick={onActivate} className="text-xs">
              <UserCheck className="mr-2 h-3.5 w-3.5" />
              Activate
            </DropdownMenuItem>
          )}

          {status === "ACTIVE" && onDeactivate && (
            <DropdownMenuItem onClick={onDeactivate} className="text-xs">
              <UserX className="mr-2 h-3.5 w-3.5" />
              Deactivate
            </DropdownMenuItem>
          )}

          {status !== "SUSPENDED" && onSuspend && (
            <DropdownMenuItem onClick={onSuspend} className="text-xs">
              <Ban className="mr-2 h-3.5 w-3.5" />
              Suspend
            </DropdownMenuItem>
          )}

          {status === "SUSPENDED" && onUnsuspend && (
            <DropdownMenuItem onClick={onUnsuspend} className="text-xs">
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Unsuspend
            </DropdownMenuItem>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-xs text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
