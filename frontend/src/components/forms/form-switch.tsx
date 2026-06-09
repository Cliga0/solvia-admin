"use client";

import { useFormContext } from "./form-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSwitchProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FormSwitch({
  name,
  label,
  description,
  disabled,
  className,
}: FormSwitchProps) {
  const form = useFormContext();
  const fieldState = form.getFieldState(name, form.formState);
  const error = fieldState.error;
  const currentValue = form.watch(name) as boolean | undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <Switch
          id={name}
          checked={currentValue || false}
          onCheckedChange={(checked) =>
            form.setValue(name, checked, { shouldValidate: true })
          }
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${name}-error` : description ? `${name}-description` : undefined
          }
        />
        {label && (
          <Label htmlFor={name} className="text-xs font-normal cursor-pointer">
            {label}
          </Label>
        )}
      </div>
      {description && !error && (
        <p id={`${name}-description`} className="text-[10px] text-muted-foreground pl-10">
          {description}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-[10px] text-destructive pl-10" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
