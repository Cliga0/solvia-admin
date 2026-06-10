"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { ConfirmDialog, DeleteConfirmDialog } from "@/components/design-system/confirm-dialog";
import { UserAvatar } from "./user-avatar";
import {
  useUser,
  useUserPermissions,
  useUserActivity,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useUnsuspendUser,
  useDeleteUser,
} from "../hooks";
import { Can } from "@/features/auth";
import { Mail, Phone, Calendar, Clock, Shield, ShieldCheck, ShieldAlert, Key, Activity, UserCheck, UserX, Ban, RotateCcw, Trash2, CreditCard as Edit, ExternalLink } from "lucide-react";
import Link from "next/link";

interface UserDetailDrawerProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (userId: string) => void;
}

export function UserDetailDrawer({
  userId,
  open,
  onOpenChange,
  onEdit,
}: UserDetailDrawerProps) {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const { data: user, isLoading: userLoading } = useUser(userId || "");
  const { data: permissions } = useUserPermissions(userId || "");
  const { data: activity } = useUserActivity(userId || "", 5);

  const activateUser = useActivateUser(userId || "");
  const deactivateUser = useDeactivateUser(userId || "");
  const suspendUser = useSuspendUser(userId || "");
  const unsuspendUser = useUnsuspendUser(userId || "");
  const deleteUser = useDeleteUser();

  const handleSuspend = async () => {
    await suspendUser.mutateAsync(suspendReason || "Administrative action");
    setShowSuspendDialog(false);
    setSuspendReason("");
  };

  const handleDelete = async () => {
    if (userId) {
      await deleteUser.mutateAsync(userId);
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent side="right" className="sm:max-w-lg overflow-y-auto">
          <DrawerHeader className="border-b pb-4">
            {userLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            ) : user ? (
              <div className="flex items-start gap-4">
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  email={user.email}
                  size="lg"
                />
                <div className="flex-1 space-y-1">
                  <DrawerTitle className="text-lg">
                    {user.firstName} {user.lastName}
                  </DrawerTitle>
                  <DrawerDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </DrawerDescription>
                  <div className="pt-1">
                    <UserStatusBadge status={user.status} />
                  </div>
                </div>
              </div>
            ) : (
              <DrawerTitle>User not found</DrawerTitle>
            )}
          </DrawerHeader>

          {userLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : user ? (
            <div className="p-4 space-y-6">
              {/* Quick Actions */}
              <Can permission="users.update">
                <div className="flex flex-wrap gap-2">
                  {user.status !== "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleAction(() => activateUser.mutate())}
                    >
                      <UserCheck className="h-3 w-3" />
                      Activate
                    </Button>
                  )}
                  {user.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleAction(() => deactivateUser.mutate())}
                    >
                      <UserX className="h-3 w-3" />
                      Deactivate
                    </Button>
                  )}
                  {user.status !== "SUSPENDED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setShowSuspendDialog(true)}
                    >
                      <Ban className="h-3 w-3" />
                      Suspend
                    </Button>
                  )}
                  {user.status === "SUSPENDED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleAction(() => unsuspendUser.mutate())}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Unsuspend
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        onEdit(user.id);
                        onOpenChange(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  <Link href={`/users/${user.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Full Profile
                    </Button>
                  </Link>
                </div>
              </Can>

              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Last login:</span>
                    <span>
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Roles
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Security
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Two-Factor Auth</span>
                    {user.twoFactorEnabled ? (
                      <Badge variant="outline" className="text-xs gap-1 text-success-700 border-success-300">
                        <ShieldCheck className="h-3 w-3" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 text-warning-700 border-warning-300">
                        <ShieldAlert className="h-3 w-3" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-3.5 w-3.5" />
                  Permissions
                  {Array.isArray(permissions) && permissions.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {permissions.length}
                    </Badge>
                  )}
                </h3>
                {Array.isArray(permissions) && permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {permissions.slice(0, 5).map((perm, index) => {
                      const p = perm as { code: string };
                      return (
                        <Badge key={index} variant="outline" className="text-xs">
                          {p.code}
                        </Badge>
                      );
                    })}
                    {permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{permissions.length - 5} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No permissions found</p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  Recent Activity
                </h3>
                {Array.isArray(activity) && activity.length > 0 ? (
                  <div className="space-y-2">
                    {activity.slice(0, 3).map((item) => {
                      const a = item as { id: string; action: string; createdAt: string };
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="truncate">{a.action}</span>
                          <span className="text-muted-foreground">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                )}
              </div>
            </div>
          ) : null}

          <DrawerFooter className="border-t">
            <DrawerClose>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DrawerClose>
            <Can permission="users.delete">
              {user && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete User
                </Button>
              )}
            </Can>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Suspend Dialog */}
      <ConfirmDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        variant="warning"
        title="Suspend User"
        description={`Are you sure you want to suspend ${user?.firstName} ${user?.lastName}? They will lose access immediately.`}
        confirmLabel="Suspend"
        onConfirm={handleSuspend}
        loading={suspendUser.isPending}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemName={user ? `${user.firstName} ${user.lastName}` : ""}
        itemType="user"
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
      />
    </>
  );
}
