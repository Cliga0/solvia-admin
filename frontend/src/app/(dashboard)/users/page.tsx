"use client";

import { useState, useMemo } from "react";
import { PageHeader, StatCard } from "@/components/design-system";
import { DataTable, FilterBar, BulkActions } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import { DeleteConfirmDialog } from "@/components/design-system/confirm-dialog";
import { Can } from "@/features/auth";
import { UserNameCell } from "@/features/users/components/user-avatar";
import { UserStatusActions } from "@/features/users/components/user-status-actions";
import { UserForm } from "@/features/users/components/user-form";
import {
  useUsersDashboard,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useUnsuspendUser,
} from "@/features/users/hooks";
import { Plus, Users as UsersIcon, UserCheck, UserX, Clock, TriangleAlert as AlertTriangle } from "lucide-react";
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

  const { data: dashboard, isLoading: dashboardLoading } = useUsersDashboard();
  const { data: usersData, isLoading: usersLoading } = useUsers({
    ...params,
    search: search || undefined,
    status: statusFilter,
  });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(editingUser?.id || "");
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser(editingUser?.id || "");
  const deactivateUser = useDeactivateUser(editingUser?.id || "");
  const suspendUser = useSuspendUser(suspendingUser?.id || "");
  const unsuspendUser = useUnsuspendUser(editingUser?.id || "");

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <UserNameCell
          firstName={row.original.firstName}
          lastName={row.original.lastName}
          email={row.original.email}
        />
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
          onActivate={() => activateUser.mutate()}
          onDeactivate={() => deactivateUser.mutate()}
          onSuspend={() => setSuspendingUser(row.original)}
          onUnsuspend={() => unsuspendUser.mutate()}
          onDelete={() => setDeletingUser(row.original)}
        />
      ),
    },
  ], [activateUser, deactivateUser, unsuspendUser]);

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
                onClick: () => {
                  // Handle bulk activate
                  setSelectedRows([]);
                },
              },
              {
                key: "deactivate",
                label: "Deactivate",
                onClick: () => {
                  // Handle bulk deactivate
                  setSelectedRows([]);
                },
              },
              {
                key: "suspend",
                label: "Suspend",
                variant: "destructive",
                onClick: () => {
                  // Handle bulk suspend
                  setSelectedRows([]);
                },
              },
            ]}
            onClearSelection={() => setSelectedRows([])}
          />
        )}

        {usersLoading ? (
          <SkeletonTable rows={10} columns={6} />
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
          />
        )}
      </div>

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
      <Dialog open={!!suspendingUser} onOpenChange={(open) => !open && setSuspendingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-600" />
              Suspend User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {suspendingUser?.firstName} {suspendingUser?.lastName}?
              They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSuspend("Administrative action")}
              disabled={suspendUser.isPending}
            >
              {suspendUser.isPending ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
