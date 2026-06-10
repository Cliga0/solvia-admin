import { z } from "zod";

export const userStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "DISABLED", "PENDING", "ARCHIVED"]);

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
});

export const adminResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const assignRoleSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
});

export const lifecycleActionSchema = z.object({
  reason: z.string().optional(),
});

export const usersFilterSchema = z.object({
  email: z.string().optional(),
  status: userStatusSchema.optional(),
  roleCode: z.string().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type LifecycleActionInput = z.infer<typeof lifecycleActionSchema>;
export type UsersFilterInput = z.infer<typeof usersFilterSchema>;
