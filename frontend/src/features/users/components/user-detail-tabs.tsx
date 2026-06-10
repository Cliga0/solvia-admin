"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DataRow, DataSection } from "@/components/design-system";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";
import { UserKpiGrid, RiskScoreCard, RiskBreakdownGrid } from "./user-kpi-cards";
import { UserSessionsTable, UserSessionsTableSkeleton } from "./user-sessions-table";
import { UserAuditTimeline } from "./user-audit-timeline";
import { UserSecurityAlertsPanel } from "./user-security-alerts-panel";
import { IntegrationPlaceholder } from "./integration-placeholder";
import {
  Shield,
  Key,
  Clock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  KeyRound,
  ShieldOff,
  Plus,
  X,
  UserCheck,
  UserX,
  Ban,
  Lock,
  Activity,
  Shield as ShieldIcon,
  Archive,
} from "lucide-react";
import type { UserWithRoles, UserSecurityProfile, UserStatus, AuditQueryParams } from "../types";
import {
  useUserRoles,
  useUserAuditLogs,
  useUserRiskProfile,
  useUserAlerts,
  useAssignRole,
  useRemoveRole,
  useForceLogout,
  useAdminResetPassword,
  useAdminDisable2FA,
  useSuspendUser,
  useDisableUser,
  useArchiveUser,
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
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditEventFilter, setAuditEventFilter] = useState<string | undefined>();

  const rolesQuery = useUserRoles(userId);
  const assignRoleMutation = useAssignRole(userId);
  const removeRoleMutation = useRemoveRole(userId);
  const forceLogoutMutation = useForceLogout(userId);
  const resetPasswordMutation = useAdminResetPassword(userId);
  const disable2FAMutation = useAdminDisable2FA(userId);
  const suspendUserMutation = useSuspendUser(userId);
  const disableUserMutation = useDisableUser(userId);
  const archiveUserMutation = useArchiveUser(userId);

  const { data: availableRoles } = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: () => apiClient.get<Array<{ id: string; code: string; name: string }>>("/rbac/roles"),
  });

  const auditParams: AuditQueryParams = {
    page: auditPage,
    limit: 15,
    userId,
    sortDirection: "desc",
    event: auditEventFilter,
  };
  const auditQuery = useUserAuditLogs(userId, auditParams);
  const riskQuery = useUserRiskProfile(userId);
  const alertsQuery = useUserAlerts(userId);

  const userRoles = rolesQuery.data ?? user.roles ?? [];
  const activeSessionCount = securityProfile?.activeSessions?.filter(s => !s.isRevoked).length ?? 0;

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

  // KPI items for Overview tab
  const kpiItems = [
    { label: "Status", value: user.status, icon: ShieldIcon, variant: user.status === "ACTIVE" ? "success" as const : "default" as const },
    { label: "Active", value: user.isActive ? "Yes" : "No", icon: UserCheck, variant: user.isActive ? "success" as const : "warning" as const },
    { label: "2FA", value: user.twoFactorEnabled ? "Enabled" : "Disabled", icon: Lock, variant: user.twoFactorEnabled ? "success" as const : "warning" as const },
    { label: "Roles", value: userRoles.length, icon: Shield },
    { label: "Permissions", value: permissions.length, icon: Key },
    { label: "Sessions", value: activeSessionCount, icon: Activity, variant: activeSessionCount > 3 ? "warning" as const : "default" as const },
  ];

  return (
    <Tabs defaultValue="overview" className={className}>
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="sessions" className="text-xs">Sessions</TabsTrigger>
        <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        <TabsTrigger value="audit" className="text-xs">Audit</TabsTrigger>
        <TabsTrigger value="risk" className="text-xs">Risk</TabsTrigger>
        <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
        <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
      </TabsList>

      {/* PHASE A — Overview Center */}
      <TabsContent value="overview" className="mt-4 space-y-4">
        <UserKpiGrid items={kpiItems} columns={6} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <DataRow label="2FA Enabled" value={user.twoFactorEnabled ? "Yes" : "No"} />
                {user.twoFactorEnabledAt && (
                  <DataRow label="2FA Enabled At" value={new Date(user.twoFactorEnabledAt).toLocaleString()} />
                )}
                <DataRow
                  label="Last Login"
                  value={
                    user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "Never"
                  }
                />
              </DataSection>

              <DataSection title="Access Summary">
                <DataRow label="Roles" value={`${userRoles.length} assigned`} />
                <DataRow label="Permissions" value={`${permissions.length} effective`} />
                <DataRow label="Active Sessions" value={String(activeSessionCount)} />
              </DataSection>

              <DataSection title="Timestamps">
                <DataRow label="Created" value={new Date(user.createdAt).toLocaleString()} />
                <DataRow label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
              </DataSection>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* PHASE B — Active Sessions Center */}
      <TabsContent value="sessions" className="mt-4">
        {securityProfile ? (
          <UserSessionsTable
            sessions={securityProfile.activeSessions}
            onForceLogoutAll={() => setShowForceLogout(true)}
            forceLogoutLoading={forceLogoutMutation.isPending}
          />
        ) : (
          <UserSessionsTableSkeleton />
        )}
      </TabsContent>

      {/* PHASE C — Security Center Enhancement */}
      <TabsContent value="security" className="mt-4 space-y-4">
        {/* 2FA Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center gap-3">
                {user.twoFactorEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-success-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-warning-600" />
                )}
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
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

        {/* Security Summary KPIs */}
        <UserKpiGrid
          items={[
            { label: "2FA Status", value: user.twoFactorEnabled ? "Enabled" : "Disabled", icon: Lock, variant: user.twoFactorEnabled ? "success" as const : "warning" as const },
            { label: "Active Sessions", value: activeSessionCount, icon: Activity },
            { label: "Last Login", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never", icon: Clock },
          ]}
          columns={3}
        />

        {/* Security Actions */}
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
              {user.status !== "SUSPENDED" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowSuspendDialog(true)}
                  disabled={suspendUserMutation.isPending}
                >
                  <Ban className="h-3 w-3" />
                  Suspend
                </Button>
              )}
              {user.status !== "DISABLED" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowDisableDialog(true)}
                  disabled={disableUserMutation.isPending}
                >
                  <UserX className="h-3 w-3" />
                  Disable
                </Button>
              )}
              {user.status !== "ARCHIVED" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowArchiveDialog(true)}
                  disabled={archiveUserMutation.isPending}
                >
                  <Archive className="h-3 w-3" />
                  Archive
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={showForceLogout}
          onOpenChange={setShowForceLogout}
          variant="danger"
          title="Force Logout"
          description="Are you sure you want to revoke all sessions for this user? They will be logged out immediately."
          confirmLabel="Force Logout"
          onConfirm={handleForceLogout}
          loading={forceLogoutMutation.isPending}
        />

        <ConfirmDialog
          open={showDisable2FA}
          onOpenChange={setShowDisable2FA}
          variant="danger"
          title="Disable 2FA"
          description="Are you sure you want to disable two-factor authentication for this user? This is an admin override."
          confirmLabel="Disable 2FA"
          onConfirm={handleDisable2FA}
          loading={disable2FAMutation.isPending}
        />

        <ConfirmDialog
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
          variant="danger"
          title="Suspend User"
          description={`Are you sure you want to suspend ${user.email}? They will lose access immediately.`}
          confirmLabel="Suspend"
          onConfirm={() => { suspendUserMutation.mutate({}, { onSuccess: () => setShowSuspendDialog(false) }); }}
          loading={suspendUserMutation.isPending}
        />

        <ConfirmDialog
          open={showDisableDialog}
          onOpenChange={setShowDisableDialog}
          variant="danger"
          title="Disable User"
          description={`Are you sure you want to disable ${user.email}? They will lose access immediately.`}
          confirmLabel="Disable"
          onConfirm={() => { disableUserMutation.mutate({}, { onSuccess: () => setShowDisableDialog(false) }); }}
          loading={disableUserMutation.isPending}
        />

        <ConfirmDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
          variant="danger"
          title="Archive User"
          description={`Are you sure you want to archive ${user.email}? They will lose access immediately.`}
          confirmLabel="Archive"
          onConfirm={() => { archiveUserMutation.mutate({}, { onSuccess: () => setShowArchiveDialog(false) }); }}
          loading={archiveUserMutation.isPending}
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

      {/* PHASE D — Audit Center */}
      <TabsContent value="audit" className="mt-4">
        <UserAuditTimeline
          auditData={auditQuery.data?.data ?? []}
          pagination={{
            page: auditQuery.data?.pagination.page ?? 1,
            pages: auditQuery.data?.pagination.pages ?? 1,
            total: auditQuery.data?.pagination.total ?? 0,
          }}
          isLoading={auditQuery.isLoading}
          isError={auditQuery.isError}
          error={auditQuery.error}
          onPageChange={setAuditPage}
          onFilterChange={(filters) => setAuditEventFilter(filters.event)}
          onRetry={() => auditQuery.refetch()}
        />
      </TabsContent>

      {/* PHASE E — Risk Profile Center */}
      <TabsContent value="risk" className="mt-4 space-y-4">
        {riskQuery.isLoading ? (
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : riskQuery.data ? (
          <>
            <RiskScoreCard
              score={riskQuery.data.riskScore}
              level={riskQuery.data.riskLevel}
              lastCalculatedAt={riskQuery.data.lastCalculatedAt}
            />
            <RiskBreakdownGrid breakdown={riskQuery.data.breakdown} />
          </>
        ) : (
          <IntegrationPlaceholder
            title="Risk Profile"
            description="User risk profile data requires the risk scoring engine to have been executed. No risk profile found for this user."
            endpoint="GET /security/users/:id/risk"
          />
        )}
      </TabsContent>

      {/* PHASE F (partial) + Roles Tab */}
      <TabsContent value="roles" className="mt-4 space-y-4">
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

        {/* Permissions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Effective Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((code, index) => (
                  <Badge key={index} variant="outline" className="text-[10px]">
                    <Key className="h-2.5 w-2.5 mr-1" />
                    {code}
                  </Badge>
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

      {/* PHASE F — Security Alerts Center */}
      <TabsContent value="alerts" className="mt-4">
        <UserSecurityAlertsPanel
          alerts={alertsQuery.data?.data ?? []}
          isLoading={alertsQuery.isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
