"use client";

import * as React from "react";
import { Checkbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id?: string;
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function CheckboxComponent({
  className,
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  ...props
}: CheckboxProps) {
  const isIndeterminate = checked === "indeterminate";

  return (
    <Checkbox.Root
      data-slot="checkbox"
      id={id}
      checked={checked === "indeterminate" ? false : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[checked]:bg-primary data-[checked]:text-primary-foreground",
        isIndeterminate && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {isIndeterminate ? (
        <Minus className="h-3 w-3" />
      ) : (
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3 w-3" />
        </Checkbox.Indicator>
      )}
    </Checkbox.Root>
  );
}

export { CheckboxComponent as Checkbox };
