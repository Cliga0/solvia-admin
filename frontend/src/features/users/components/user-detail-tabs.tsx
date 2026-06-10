"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataRow, DataSection } from "@/components/design-system";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";
import {
  Shield,
  Key,
  Clock,
  Mail,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  KeyRound,
  ShieldOff,
  Monitor,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import type { UserWithRoles, UserSecurityProfile, UserStatus } from "../types";
import {
  useUserRoles,
  useAssignRole,
  useRemoveRole,
  useForceLogout,
  useAdminResetPassword,
  useAdminDisable2FA,
} from "../hooks";
import { apiClient } from "@/lib/api/api-client";
import { assignRoleSchema, type AssignRoleInput } from "../schemas";

interface UserDetailTabsProps {
  userId: string;
  user: UserWithRoles;
  permissions: string[];
  securityProfile: UserSecurityProfile | null;
  className?: string;
}

export function UserDetailTabs({
  userId,
  user,
  permissions,
  securityProfile,
  className,
}: UserDetailTabsProps) {
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [showForceLogout, setShowForceLogout] = useState(false);

  const rolesQuery = useUserRoles(userId);
  const assignRoleMutation = useAssignRole(userId);
  const removeRoleMutation = useRemoveRole(userId);
  const forceLogoutMutation = useForceLogout(userId);
  const resetPasswordMutation = useAdminResetPassword(userId);
  const disable2FAMutation = useAdminDisable2FA(userId);
  const { data: availableRoles } = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: () => apiClient.get<Array<{ id: string; code: string; name: string }>>("/rbac/roles"),
  });

  const userRoles = rolesQuery.data ?? user.roles ?? [];

  const handleAssignRole = () => {
    const result = assignRoleSchema.safeParse({ roleId: selectedRoleId });
    if (result.success) {
      assignRoleMutation.mutate(result.data as AssignRoleInput, {
        onSuccess: () => {
          setShowAssignRole(false);
          setSelectedRoleId("");
        },
      });
    }
  };

  const handleRemoveRole = (roleId: string) => {
    removeRoleMutation.mutate(roleId);
  };

  const handleResetPassword = () => {
    if (newPassword.length >= 8) {
      resetPasswordMutation.mutate(newPassword, {
        onSuccess: () => {
          setShowResetPassword(false);
          setNewPassword("");
        },
      });
    }
  };

  const handleForceLogout = () => {
    forceLogoutMutation.mutate(undefined, {
      onSuccess: () => setShowForceLogout(false),
    });
  };

  const handleDisable2FA = () => {
    disable2FAMutation.mutate(undefined, {
      onSuccess: () => setShowDisable2FA(false),
    });
  };

  return (
    <Tabs defaultValue="overview" className={className}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
        <TabsTrigger value="permissions" className="text-xs">Permissions</TabsTrigger>
        <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataSection title="Basic Information">
              <DataRow
                label="Email"
                value={
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                }
              />
              <DataRow label="Status" value={<UserStatusBadge status={user.status as UserStatus} />} />
              <DataRow label="Active" value={user.isActive ? "Yes" : "No"} />
            </DataSection>

            <DataSection title="Authentication">
              <DataRow
                label="2FA Enabled"
                value={user.twoFactorEnabled ? "Yes" : "No"}
              />
              {user.twoFactorEnabledAt && (
                <DataRow
                  label="2FA Enabled At"
                  value={new Date(user.twoFactorEnabledAt).toLocaleString()}
                />
              )}
            </DataSection>

            <DataSection title="Timestamps">
              <DataRow
                label="Created"
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                }
              />
              <DataRow
                label="Updated"
                value={new Date(user.updatedAt).toLocaleString()}
              />
              <DataRow
                label="Last Login"
                value={
                  user.lastLoginAt ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </div>
                  ) : (
                    "Never"
                  )
                }
              />
            </DataSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="roles" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Assigned Roles</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowAssignRole(true)}
              >
                <Plus className="h-3 w-3" />
                Assign Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        Assigned {new Date(role.assignedAt).toLocaleDateString()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveRole(role.id)}
                        disabled={removeRoleMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No roles assigned
                </p>
              )}
            </div>

            {showAssignRole && (
              <div className="mt-4 rounded-md border p-3 space-y-3">
                <Label className="text-xs">Select Role</Label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full h-8 rounded-md border bg-background px-3 text-xs"
                >
                  <option value="">-- Select a role --</option>
                  {(availableRoles as Array<{ id: string; code: string; name: string }> | undefined)
                    ?.filter((r) => !userRoles.some((ur) => ur.id === r.id))
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.code})
                      </option>
                    ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAssignRole}
                    disabled={!selectedRoleId || assignRoleMutation.isPending}
                  >
                    Assign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => { setShowAssignRole(false); setSelectedRoleId(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Effective Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="grid gap-2">
                {permissions.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{code}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No permissions found
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="mt-4 space-y-4">
        {/* 2FA Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                {user.twoFactorEnabled ? (
                  <ShieldCheck className="h-4 w-4 text-success-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-warning-600" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.twoFactorEnabled
                      ? user.twoFactorEnabledAt
                        ? `Enabled on ${new Date(user.twoFactorEnabledAt).toLocaleString()}`
                        : "Enabled"
                      : "Disabled"}
                  </p>
                </div>
              </div>
              {user.twoFactorEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowDisable2FA(true)}
                  disabled={disable2FAMutation.isPending}
                >
                  <ShieldOff className="h-3 w-3" />
                  Disable 2FA
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Sessions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowForceLogout(true)}
              >
                <LogOut className="h-3 w-3" />
                Force Logout All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {securityProfile?.activeSessions && securityProfile.activeSessions.length > 0 ? (
              <div className="space-y-2">
                {securityProfile.activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {session.userAgent || "Unknown device"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {session.ip && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.ip}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Login: {new Date(session.loginAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            Last active: {new Date(session.lastActiveAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={session.isRevoked ? "secondary" : "default"}
                      className="text-[10px]"
                    >
                      {session.isRevoked ? "Revoked" : "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active sessions
              </p>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Security Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowForceLogout(true)}
                disabled={forceLogoutMutation.isPending}
              >
                <LogOut className="h-3 w-3" />
                Force Logout
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowResetPassword(true)}
                disabled={resetPasswordMutation.isPending}
              >
                <KeyRound className="h-3 w-3" />
                Reset Password
              </Button>
              {user.twoFactorEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowDisable2FA(true)}
                  disabled={disable2FAMutation.isPending}
                >
                  <ShieldOff className="h-3 w-3" />
                  Disable 2FA
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Last Login */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Login Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DataRow
              label="Last Login"
              value={
                securityProfile?.lastLoginAt
                  ? new Date(securityProfile.lastLoginAt).toLocaleString()
                  : user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "Never"
              }
            />
          </CardContent>
        </Card>

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={showForceLogout}
          onOpenChange={setShowForceLogout}
          variant="warning"
          title="Force Logout"
          description="Are you sure you want to revoke all sessions for this user? They will be logged out immediately."
          confirmLabel="Force Logout"
          onConfirm={handleForceLogout}
          loading={forceLogoutMutation.isPending}
        />

        <ConfirmDialog
          open={showDisable2FA}
          onOpenChange={setShowDisable2FA}
          variant="warning"
          title="Disable 2FA"
          description="Are you sure you want to disable two-factor authentication for this user? This is an admin override."
          confirmLabel="Disable 2FA"
          onConfirm={handleDisable2FA}
          loading={disable2FAMutation.isPending}
        />

        {/* Reset Password Dialog */}
        {showResetPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-sm">Reset Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs">
                    New Password (min 8 characters)
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => { setShowResetPassword(false); setNewPassword(""); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleResetPassword}
                    disabled={newPassword.length < 8 || resetPasswordMutation.isPending}
                  >
                    Reset Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
