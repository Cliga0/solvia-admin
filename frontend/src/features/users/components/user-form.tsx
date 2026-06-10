"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "../schemas";
import type { UserWithRoles } from "../types";

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: UserWithRoles;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

function CreateUserForm({
  onSubmit,
  onCancel,
  isLoading,
  className,
}: Omit<UserFormProps, "mode" | "initialData">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <Label htmlFor="password" className="text-xs">
            Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            aria-invalid={!!errors.password}
            className={cn(errors.password && "border-destructive")}
          />
          {errors.password && (
            <p className="text-[10px] text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}

function EditUserForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  className,
}: Omit<UserFormProps, "mode"> & { initialData?: UserWithRoles }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: initialData ? { email: initialData.email } : { email: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function UserForm(props: UserFormProps) {
  if (props.mode === "create") {
    return <CreateUserForm {...props} />;
  }
  return <EditUserForm {...props} />;
}
