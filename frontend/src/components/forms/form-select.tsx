"use client";

import { useFormContext } from "./form-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  name,
  label,
  description,
  required,
  placeholder,
  options,
  disabled,
  className,
}: FormSelectProps) {
  const form = useFormContext();
  const fieldState = form.getFieldState(name, form.formState);
  const error = fieldState.error;
  const currentValue = form.watch(name) as string | undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={name} className="text-xs">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Select
        value={currentValue || ""}
        onValueChange={(value) => form.setValue(name, value, { shouldValidate: true })}
        disabled={disabled}
      >
        <SelectTrigger
          id={name}
          className={cn("h-8", error && "border-destructive")}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${name}-error` : description ? `${name}-description` : undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && !error && (
        <p id={`${name}-description`} className="text-[10px] text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-[10px] text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
