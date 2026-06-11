"use client";

import { use, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { UserAvatar } from "@/features/users/components/user-avatar";
import { UserDetailTabs } from "@/features/users/components/user-detail-tabs";
import { UserStatusActions } from "@/features/users/components/user-status-actions";
import {
  useUser,
  useUserPermissions,
  useUserSecurityProfile,
  useActivateUser,
  useSuspendUser,
  useDisableUser,
  useArchiveUser,
} from "@/features/users/hooks";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";
import { Can } from "@/features/auth";
import { Mail, Calendar, Shield, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { UserStatus } from "@/features/users/types";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const { data: user, isLoading: userLoading } = useUser(id);
  const { data: permissions } = useUserPermissions(id);
  const { data: securityProfile } = useUserSecurityProfile(id);

  const activateUser = useActivateUser(id);
  const suspendUser = useSuspendUser(id);
  const disableUser = useDisableUser(id);
  const archiveUser = useArchiveUser(id);

  const handleTabChange = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(`/users/${id}${query ? `?${query}` : ""}`, { scroll: false });
  }, [id, router, searchParams]);

  const handleSuspend = async () => {
    await suspendUser.mutateAsync({});
    setShowSuspendDialog(false);
  };

  const handleDisable = async () => {
    await disableUser.mutateAsync({});
    setShowDisableDialog(false);
  };

  const handleArchive = async () => {
    await archiveUser.mutateAsync({});
    setShowArchiveDialog(false);
  };

  if (userLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-20" />
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-5 w-20 mt-2" />
            </div>
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-3">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-12" />
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">User not found</p>
        <p className="text-sm text-muted-foreground/70 mb-4">The requested user does not exist or you do not have access.</p>
        <Link href="/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );
  }

  const activeSessionCount = securityProfile?.activeSessions?.filter(s => !s.isRevoked).length ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Breadcrumbs segmentLabels={{ [id]: user.email }} />
      </div>

      {/* User Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar email={user.email} size="lg" />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">{user.email}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {user.lastLoginAt ? `Last login: ${new Date(user.lastLoginAt).toLocaleDateString()}` : "Never logged in"}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <UserStatusBadge status={user.status as UserStatus} />
                {user.twoFactorEnabled && (
                  <span className="flex items-center gap-1 text-[10px] text-success-700">
                    <Shield className="h-3 w-3" />
                    2FA
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  {activeSessionCount} session{activeSessionCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Can permission="users.update">
              <UserStatusActions
                userId={id}
                status={user.status}
                onActivate={() => activateUser.mutate()}
                onSuspend={() => setShowSuspendDialog(true)}
                onDisable={() => setShowDisableDialog(true)}
                onArchive={() => setShowArchiveDialog(true)}
              />
            </Can>
          </div>
        </div>
      </Card>

      {/* User Tabs */}
      <UserDetailTabs
        userId={id}
        user={user}
        permissions={permissions ?? []}
        securityProfile={securityProfile ?? null}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <ConfirmDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        variant="danger"
        title="Suspend User"
        description={`Are you sure you want to suspend ${user.email}? They will lose access immediately and all sessions will be revoked.`}
        confirmLabel="Suspend"
        onConfirm={handleSuspend}
        loading={suspendUser.isPending}
      />

      <ConfirmDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
        variant="danger"
        title="Disable User"
        description={`Are you sure you want to disable ${user.email}? They will lose access immediately and all sessions will be revoked.`}
        confirmLabel="Disable"
        onConfirm={handleDisable}
        loading={disableUser.isPending}
      />

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        variant="danger"
        title="Archive User"
        description={`Are you sure you want to archive ${user.email}? They will lose access immediately and all sessions will be revoked.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        loading={archiveUser.isPending}
      />
    </div>
  );
}
