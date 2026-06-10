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
import {
  MoveHorizontal as MoreHorizontal,
  UserCheck,
  Ban,
  UserX,
  Archive,
  LogOut,
  KeyRound,
  ShieldOff,
} from "lucide-react";
import type { UserStatus } from "../types";

interface UserStatusActionsProps {
  userId: string;
  status: UserStatus;
  onActivate?: () => void;
  onSuspend?: () => void;
  onDisable?: () => void;
  onArchive?: () => void;
  onForceLogout?: () => void;
  onResetPassword?: () => void;
  onDisable2FA?: () => void;
  className?: string;
}

export function UserStatusActions({
  userId: _userId,
  status,
  onActivate,
  onSuspend,
  onDisable,
  onArchive,
  onForceLogout,
  onResetPassword,
  onDisable2FA,
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
          <DropdownMenuLabel className="text-xs">Lifecycle</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {status !== "ACTIVE" && onActivate && (
            <DropdownMenuItem onClick={onActivate} className="text-xs">
              <UserCheck className="mr-2 h-3.5 w-3.5" />
              Activate
            </DropdownMenuItem>
          )}

          {status !== "SUSPENDED" && onSuspend && (
            <DropdownMenuItem onClick={onSuspend} className="text-xs">
              <Ban className="mr-2 h-3.5 w-3.5" />
              Suspend
            </DropdownMenuItem>
          )}

          {status !== "DISABLED" && onDisable && (
            <DropdownMenuItem onClick={onDisable} className="text-xs">
              <UserX className="mr-2 h-3.5 w-3.5" />
              Disable
            </DropdownMenuItem>
          )}

          {status !== "ARCHIVED" && onArchive && (
            <DropdownMenuItem onClick={onArchive} className="text-xs">
              <Archive className="mr-2 h-3.5 w-3.5" />
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuLabel className="text-xs">Security</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {onForceLogout && (
            <DropdownMenuItem onClick={onForceLogout} className="text-xs">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Force Logout
            </DropdownMenuItem>
          )}

          {onResetPassword && (
            <DropdownMenuItem onClick={onResetPassword} className="text-xs">
              <KeyRound className="mr-2 h-3.5 w-3.5" />
              Reset Password
            </DropdownMenuItem>
          )}

          {onDisable2FA && (
            <DropdownMenuItem onClick={onDisable2FA} className="text-xs">
              <ShieldOff className="mr-2 h-3.5 w-3.5" />
              Disable 2FA
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
