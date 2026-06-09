"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "../schemas";
import type { UserStatus, UserWithRoles } from "../types";
import type { FieldErrors } from "react-hook-form";

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: UserWithRoles;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
];

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  className,
}: UserFormProps) {
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" && initialData
      ? {
          email: initialData.email,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          phone: initialData.phone || "",
          status: initialData.status,
        }
      : {
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          password: "",
          confirmPassword: "",
          status: "PENDING",
          roleIds: [],
        },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const status = watch("status");

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              {...register("firstName")}
              aria-invalid={!!errors.firstName}
              className={cn(errors.firstName && "border-destructive")}
            />
            {errors.firstName && (
              <p className="text-[10px] text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              {...register("lastName")}
              aria-invalid={!!errors.lastName}
              className={cn(errors.lastName && "border-destructive")}
            />
            {errors.lastName && (
              <p className="text-[10px] text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={!!errors.email}
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="text-[10px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              aria-invalid={!!errors.phone}
              className={cn(errors.phone && "border-destructive")}
            />
            {errors.phone && (
              <p className="text-[10px] text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setValue("status", value as UserStatus)}
            >
              <SelectTrigger
                className={cn("h-8", errors.status && "border-destructive")}
              >
                {statusOptions.find((o) => o.value === status)?.label || "Select status"}
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-[10px] text-destructive">{errors.status.message}</p>
            )}
          </div>
        </div>

        {mode === "create" && (() => {
          const createErrors = errors as FieldErrors<CreateUserInput>;
          return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!createErrors.password}
                  className={cn(createErrors.password && "border-destructive")}
                />
                {createErrors.password && (
                  <p className="text-[10px] text-destructive">{createErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  aria-invalid={!!createErrors.confirmPassword}
                  className={cn(createErrors.confirmPassword && "border-destructive")}
                />
                {createErrors.confirmPassword && (
                  <p className="text-[10px] text-destructive">{createErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          );
        })()}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
