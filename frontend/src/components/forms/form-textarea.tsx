"use client";

import { useFormContext } from "./form-context";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
}

export function FormTextarea({
  name,
  label,
  description,
  required,
  className,
  id,
  ...props
}: FormTextareaProps) {
  const form = useFormContext();
  const fieldState = form.getFieldState(name, form.formState);
  const error = fieldState.error;

  const inputId = id || name;
  const { ref, ...registerProps } = form.register(name);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-xs">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Textarea
        {...props}
        {...registerProps}
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : description ? `${inputId}-description` : undefined
        }
        className={cn(error && "border-destructive")}
      />
      {description && !error && (
        <p id={`${inputId}-description`} className="text-[10px] text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-[10px] text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
