"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataRow, DataSection } from "@/components/design-system";
import { UserStatusBadge } from "@/components/design-system/status-badge";
import {
  Shield,
  Key,
  Activity,
  Clock,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { UserWithRoles, UserStatus } from "../types";

interface UserDetailTabsProps {
  user: UserWithRoles;
  permissions: unknown[];
  securityProfile: unknown;
  activity: unknown[];
  className?: string;
}

export function UserDetailTabs({
  user,
  permissions,
  securityProfile: _securityProfile,
  activity,
  className,
}: UserDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className={className}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
        <TabsTrigger value="permissions" className="text-xs">Permissions</TabsTrigger>
        <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataSection title="Basic Information">
              <DataRow label="Full Name" value={`${user.firstName} ${user.lastName}`} />
              <DataRow
                label="Email"
                value={
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                }
              />
              <DataRow
                label="Phone"
                value={user.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </div>
                ) : "-"}
              />
              <DataRow label="Status" value={<UserStatusBadge status={user.status as UserStatus} />} />
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
            <CardTitle className="text-sm">Assigned Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
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
                    <Badge variant="outline" className="text-[10px]">
                      Assigned {new Date(role.assignedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No roles assigned
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Effective Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(permissions) && permissions.length > 0 ? (
              <div className="grid gap-2">
                {(permissions as Array<{ code: string; name: string; source?: string }>).map((perm, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{perm.name || perm.code}</p>
                        <p className="text-xs text-muted-foreground">{perm.code}</p>
                      </div>
                    </div>
                    {perm.source && (
                      <Badge variant="secondary" className="text-[10px]">
                        {perm.source}
                      </Badge>
                    )}
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

      <TabsContent value="security" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Security Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {user.twoFactorEnabled ? (
                    <ShieldCheck className="h-4 w-4 text-success-600" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-warning-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">
                      {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Badge variant={user.twoFactorEnabled ? "default" : "secondary"} className="text-[10px]">
                  {user.twoFactorEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-xs text-muted-foreground">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(activity) && activity.length > 0 ? (
              <div className="space-y-2">
                {(activity as Array<{ id: string; action: string; createdAt: string }>).slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
