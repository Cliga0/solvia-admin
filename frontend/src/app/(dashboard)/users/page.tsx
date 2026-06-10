"use client";

import { useState, useMemo } from "react";
import { PageHeader, StatCard } from "@/components/design-system";
import { DataTable, FilterBar, BulkActions } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { DeleteConfirmDialog, SuspendConfirmDialog, BulkSuspendConfirmDialog } from "@/components/design-system/confirm-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Can } from "@/features/auth";
import { UserNameCell } from "@/features/users/components/user-avatar";
import { UserStatusActions } from "@/features/users/components/user-status-actions";
import { UserForm } from "@/features/users/components/user-form";
import { UserDetailDrawer } from "@/features/users/components/user-detail-drawer";
import {
  useUsersDashboard,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser,
  useBulkActivateUsers,
  useBulkDeactivateUsers,
  useBulkSuspendUsers,
  useBulkDeleteUsers,
} from "@/features/users/hooks";
import { Plus, Users as UsersIcon, UserCheck, UserX, Clock } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { User, UserStatus, UsersQueryParams } from "@/features/users/types";
import type { CreateUserInput, UpdateUserInput } from "@/features/users/schemas";

export default function UsersPage() {
  const [params, setParams] = useState<UsersQueryParams>({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [bulkSuspendReason, setBulkSuspendReason] = useState("");
  const [showBulkSuspendDialog, setShowBulkSuspendDialog] = useState(false);

  const { data: dashboard, isLoading: dashboardLoading } = useUsersDashboard();
  const { data: usersData, isLoading: usersLoading, isError: usersError, error } = useUsers({
    ...params,
    search: search || undefined,
    status: statusFilter,
  });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(editingUser?.id || "");
  const deleteUser = useDeleteUser();
  const suspendUser = useSuspendUser(suspendingUser?.id || "");

  const bulkActivate = useBulkActivateUsers();
  const bulkDeactivate = useBulkDeactivateUsers();
  const bulkSuspend = useBulkSuspendUsers();
  const bulkDelete = useBulkDeleteUsers();

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
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => handleRowClick(row.original.id)}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <UserNameCell
            firstName={row.original.firstName}
            lastName={row.original.lastName}
            email={row.original.email}
          />
        </button>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
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
          onDelete={() => setDeletingUser(row.original)}
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

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteUser.mutateAsync(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const handleSuspend = async (reason: string) => {
    if (suspendingUser) {
      await suspendUser.mutateAsync(reason);
      setSuspendingUser(null);
    }
  };

  const handleBulkActivate = async () => {
    await bulkActivate.mutateAsync(selectedRows);
    setSelectedRows([]);
  };

  const handleBulkDeactivate = async () => {
    await bulkDeactivate.mutateAsync(selectedRows);
    setSelectedRows([]);
  };

  const handleBulkSuspend = async (reason: string) => {
    await bulkSuspend.mutateAsync({ ids: selectedRows, reason });
    setSelectedRows([]);
    setShowBulkSuspendDialog(false);
    setBulkSuspendReason("");
  };

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedRows);
    setSelectedRows([]);
  };

  const filterOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "SUSPENDED", label: "Suspended" },
  ];

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
      <div className="grid gap-4 md:grid-cols-4">
        {dashboardLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={dashboard?.totalUsers ?? 0}
              icon={UsersIcon}
            />
            <StatCard
              title="Active Users"
              value={dashboard?.activeUsers ?? 0}
              icon={UserCheck}
            />
            <StatCard
              title="Suspended Users"
              value={dashboard?.suspendedUsers ?? 0}
              icon={UserX}
            />
            <StatCard
              title="Pending Users"
              value={dashboard?.pendingUsers ?? 0}
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Filters and Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <FilterBar
            filters={{ search: search || undefined, status: statusFilter }}
            filterConfigs={[
              { key: "search", type: "text", label: "Search", placeholder: "Search users..." },
              {
                key: "status",
                type: "select",
                label: "Status",
                placeholder: "All statuses",
                options: filterOptions,
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "search") setSearch(value || "");
              if (key === "status") setStatusFilter(value as UserStatus | undefined);
            }}
            onClearAll={() => {
              setSearch("");
              setStatusFilter(undefined);
            }}
          />
        </div>

        {selectedRows.length > 0 && (
          <BulkActions
            selectedCount={selectedRows.length}
            actions={[
              {
                key: "activate",
                label: "Activate",
                onClick: handleBulkActivate,
              },
              {
                key: "deactivate",
                label: "Deactivate",
                onClick: handleBulkDeactivate,
              },
              {
                key: "suspend",
                label: "Suspend",
                variant: "destructive",
                onClick: () => setShowBulkSuspendDialog(true),
              },
              {
                key: "delete",
                label: "Delete",
                variant: "destructive",
                onClick: handleBulkDelete,
              },
            ]}
            onClearSelection={() => setSelectedRows([])}
          />
        )}

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
            message={search || statusFilter
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first user."}
            action={
              !search && !statusFilter && (
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

      {/* Create User Dialog */}
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
                ? "Update user information and settings"
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        itemName={deletingUser ? `${deletingUser.firstName} ${deletingUser.lastName}` : ""}
        itemType="user"
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
      />

      {/* Suspend Dialog */}
      <SuspendConfirmDialog
        open={!!suspendingUser}
        onOpenChange={(open) => !open && setSuspendingUser(null)}
        userName={suspendingUser ? `${suspendingUser.firstName} ${suspendingUser.lastName}` : ""}
        onConfirm={handleSuspend}
        loading={suspendUser.isPending}
      />

      {/* Bulk Suspend Dialog */}
      <BulkSuspendConfirmDialog
        open={showBulkSuspendDialog}
        onOpenChange={setShowBulkSuspendDialog}
        count={selectedRows.length}
        reason={bulkSuspendReason}
        onReasonChange={setBulkSuspendReason}
        onConfirm={handleBulkSuspend}
        loading={bulkSuspend.isPending}
      />
    </div>
  );
}
