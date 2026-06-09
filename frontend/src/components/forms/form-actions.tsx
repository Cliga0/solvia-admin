"use client";

import { Button } from "@/components/ui/button";
import { Loader as Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormContext } from "./form-context";

interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  align?: "left" | "right" | "full";
  className?: string;
}

export function FormActions({
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
  align = "right",
  className,
}: FormActionsProps) {
  const form = useFormContext();
  const { isSubmitting } = form.formState;

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "right" && "justify-end",
        align === "full" && "w-full",
        className
      )}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs h-8"
        >
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting} className="text-xs h-8">
        {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}
