"use client";

import { use } from "react";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
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
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <p className="text-muted-foreground">User not found</p>
        <Link href="/users">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="sm" className="h-8">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
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
              </div>
              <div className="pt-2">
                <UserStatusBadge status={user.status} />
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
      />

      {/* Suspend Dialog */}
      <ConfirmDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        variant="warning"
        title="Suspend User"
        description={`Are you sure you want to suspend ${user.email}? They will lose access immediately.`}
        confirmLabel="Suspend"
        onConfirm={handleSuspend}
        loading={suspendUser.isPending}
      />

      {/* Disable Dialog */}
      <ConfirmDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
        variant="warning"
        title="Disable User"
        description={`Are you sure you want to disable ${user.email}? They will lose access immediately.`}
        confirmLabel="Disable"
        onConfirm={handleDisable}
        loading={disableUser.isPending}
      />

      {/* Archive Dialog */}
      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        variant="warning"
        title="Archive User"
        description={`Are you sure you want to archive ${user.email}? They will lose access immediately.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        loading={archiveUser.isPending}
      />
    </div>
  );
}
