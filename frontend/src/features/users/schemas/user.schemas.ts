import { z } from "zod";

export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]);

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  phone: z.string().optional().refine(
    (val) => !val || /^[+]?[\d\s()-]{7,20}$/.test(val),
    "Invalid phone number"
  ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm password"),
  status: userStatusSchema.default("PENDING"),
  roleIds: z.array(z.string().uuid()).min(1, "At least one role is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  firstName: z.string().min(1, "First name is required").max(50, "First name too long").optional(),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long").optional(),
  phone: z.string().optional().nullable().refine(
    (val) => !val || /^[+]?[\d\s()-]{7,20}$/.test(val),
    "Invalid phone number"
  ),
  status: userStatusSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const assignRoleSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
});

export const usersFilterSchema = z.object({
  search: z.string().optional(),
  status: userStatusSchema.optional(),
  role: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type UsersFilterInput = z.infer<typeof usersFilterSchema>;
