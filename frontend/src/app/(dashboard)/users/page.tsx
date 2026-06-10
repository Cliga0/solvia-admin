"use client";

import { useState, useMemo } from "react";
import { PageHeader, StatCard } from "@/components/design-system";
import { DataTable, FilterBar } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Can } from "@/features/auth";
import { UserNameCell } from "@/features/users/components/user-avatar";
import { UserStatusActions } from "@/features/users/components/user-status-actions";
import { UserForm } from "@/features/users/components/user-form";
import { UserDetailDrawer } from "@/features/users/components/user-detail-drawer";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useSuspendUser,
  useDisableUser,
  useArchiveUser,
} from "@/features/users/hooks";
import { Plus, Users as UsersIcon, UserCheck, UserX, Clock, Ban, Archive } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { User, UserStatus, UsersQueryParams } from "@/features/users/types";
import type { CreateUserInput, UpdateUserInput } from "@/features/users/schemas";

export default function UsersPage() {
  const [params, setParams] = useState<UsersQueryParams>({ page: 1, limit: 20 });
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();
  const [roleCodeFilter, setRoleCodeFilter] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [, setSelectedRows] = useState<string[]>([]);  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [disablingUser, setDisablingUser] = useState<User | null>(null);
  const [archivingUser, setArchivingUser] = useState<User | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const { data: usersData, isLoading: usersLoading, isError: usersError, error } = useUsers({
    ...params,
    email: emailFilter || undefined,
    status: statusFilter,
    roleCode: roleCodeFilter || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(editingUser?.id || "");
  const suspendUser = useSuspendUser(suspendingUser?.id || "");
  const disableUser = useDisableUser(disablingUser?.id || "");
  const archiveUser = useArchiveUser(archivingUser?.id || "");

  const handleRowClick = (userId: string) => {
    setDrawerUserId(userId);
    setShowDrawer(true);
  };

  const handleEditFromDrawer = (userId: string) => {
    const user = usersData?.data.find((u) => u.id === userId);
    if (user) {
      setEditingUser(user);
    }
  };

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: "email",
      header: "User",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => handleRowClick(row.original.id)}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <UserNameCell email={row.original.email} />
        </button>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "twoFactorEnabled",
      header: "2FA",
      cell: ({ row }) => row.original.twoFactorEnabled ? "Enabled" : "Disabled",
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) =>
        row.original.lastLoginAt
          ? new Date(row.original.lastLoginAt).toLocaleDateString()
          : "Never",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <UserStatusActions
          userId={row.original.id}
          status={row.original.status}
          onSuspend={() => setSuspendingUser(row.original)}
          onDisable={() => setDisablingUser(row.original)}
          onArchive={() => setArchivingUser(row.original)}
        />
      ),
    },
  ], []);

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page: page + 1 }));
  };

  const handlePageSizeChange = (limit: number) => {
    setParams((prev) => ({ ...prev, page: 1, limit }));
  };

  const handleCreateSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    if (editingUser) {
      await updateUser.mutateAsync(data as UpdateUserInput);
      setEditingUser(null);
    } else {
      await createUser.mutateAsync(data as CreateUserInput);
      setShowCreateDialog(false);
    }
  };

  const handleSuspend = async (reason?: string) => {
    if (suspendingUser) {
      await suspendUser.mutateAsync({ reason });
      setSuspendingUser(null);
    }
  };

  const handleDisable = async (reason?: string) => {
    if (disablingUser) {
      await disableUser.mutateAsync({ reason });
      setDisablingUser(null);
    }
  };

  const handleArchive = async (reason?: string) => {
    if (archivingUser) {
      await archiveUser.mutateAsync({ reason });
      setArchivingUser(null);
    }
  };

  const statusFilterOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "DISABLED", label: "Disabled" },
    { value: "PENDING", label: "Pending" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  // Compute KPIs from list data
  const kpis = useMemo(() => {
    const data = usersData?.data ?? [];
    return {
      total: usersData?.pagination.total ?? 0,
      active: data.filter((u) => u.status === "ACTIVE").length,
      suspended: data.filter((u) => u.status === "SUSPENDED").length,
      disabled: data.filter((u) => u.status === "DISABLED").length,
      archived: data.filter((u) => u.status === "ARCHIVED").length,
      twoFA: data.filter((u) => u.twoFactorEnabled).length,
    };
  }, [usersData]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="User Management"
        description="Manage internal Solvia users, roles, and permissions"
        actions={
          <Can permission="users.create">
            <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 h-8 text-xs">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </Can>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        {usersLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={kpis.total}
              icon={UsersIcon}
            />
            <StatCard
              title="Active"
              value={kpis.active}
              icon={UserCheck}
            />
            <StatCard
              title="Suspended"
              value={kpis.suspended}
              icon={Ban}
            />
            <StatCard
              title="Disabled"
              value={kpis.disabled}
              icon={UserX}
            />
            <StatCard
              title="Archived"
              value={kpis.archived}
              icon={Archive}
            />
            <StatCard
              title="2FA Enabled"
              value={kpis.twoFA}
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Filters and Table */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <FilterBar
              filters={{ email: emailFilter || undefined, status: statusFilter }}
              filterConfigs={[
                { key: "email", type: "text", label: "Email", placeholder: "Search by email..." },
                {
                  key: "status",
                  type: "select",
                  label: "Status",
                  placeholder: "All statuses",
                  options: statusFilterOptions,
                },
              ]}
              onFilterChange={(key, value) => {
                if (key === "email") setEmailFilter(value || "");
                if (key === "status") setStatusFilter(value as UserStatus | undefined);
              }}
              onClearAll={() => {
                setEmailFilter("");
                setStatusFilter(undefined);
                setRoleCodeFilter("");
                setCreatedFrom("");
                setCreatedTo("");
              }}
            />
          </div>

          {/* Advanced Filters */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Role Code</Label>
              <Input
                placeholder="e.g. SECURITY_MANAGER"
                value={roleCodeFilter}
                onChange={(e) => setRoleCodeFilter(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Created From</Label>
              <Input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Created To</Label>
              <Input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {usersLoading ? (
          <SkeletonTable rows={10} columns={6} />
        ) : usersError ? (
          <ErrorState
            title="Failed to load users"
            message={error?.message || "An error occurred while loading users."}
            onRetry={() => window.location.reload()}
          />
        ) : usersData?.data.length === 0 ? (
          <EmptyState
            title="No users found"
            message={emailFilter || statusFilter
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first user."}
            action={
              !emailFilter && !statusFilter && (
                <Can permission="users.create">
                  <Button onClick={() => setShowCreateDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </Can>
              )
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={usersData?.data ?? []}
            pageCount={usersData?.pagination.pages ?? 1}
            pageIndex={(usersData?.pagination.page ?? 1) - 1}
            pageSize={usersData?.pagination.limit ?? 20}
            onPaginationChange={(page, pageSize) => {
              if (pageSize !== params.limit) {
                handlePageSizeChange(pageSize);
              } else {
                handlePageChange(page);
              }
            }}
            onRowSelection={setSelectedRows}
          />
        )}
      </div>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userId={drawerUserId}
        open={showDrawer}
        onOpenChange={setShowDrawer}
        onEdit={handleEditFromDrawer}
      />

      {/* Create/Edit User Dialog */}
      <Dialog open={showCreateDialog || !!editingUser} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingUser(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user email address"
                : "Add a new user to the platform"}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            mode={editingUser ? "edit" : "create"}
            initialData={editingUser ? { ...editingUser, roles: [] } : undefined}
            onSubmit={handleCreateSubmit}
            onCancel={() => {
              setShowCreateDialog(false);
              setEditingUser(null);
            }}
            isLoading={createUser.isPending || updateUser.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <ConfirmDialog
        open={!!suspendingUser}
        onOpenChange={(open) => !open && setSuspendingUser(null)}
        variant="warning"
        title="Suspend User"
        description={`Are you sure you want to suspend ${suspendingUser?.email}? They will lose access immediately.`}
        confirmLabel="Suspend"
        onConfirm={() => handleSuspend()}
        loading={suspendUser.isPending}
      />

      {/* Disable Dialog */}
      <ConfirmDialog
        open={!!disablingUser}
        onOpenChange={(open) => !open && setDisablingUser(null)}
        variant="warning"
        title="Disable User"
        description={`Are you sure you want to disable ${disablingUser?.email}? They will lose access immediately.`}
        confirmLabel="Disable"
        onConfirm={() => handleDisable()}
        loading={disableUser.isPending}
      />

      {/* Archive Dialog */}
      <ConfirmDialog
        open={!!archivingUser}
        onOpenChange={(open) => !open && setArchivingUser(null)}
        variant="warning"
        title="Archive User"
        description={`Are you sure you want to archive ${archivingUser?.email}? They will lose access immediately.`}
        confirmLabel="Archive"
        onConfirm={() => handleArchive()}
        loading={archiveUser.isPending}
      />
    </div>
  );
}
