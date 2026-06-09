"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  divider = false,
}: FormSectionProps) {
  return (
    <>
      {divider && <Separator className="my-6" />}
      <div className={cn("space-y-4", className)}>
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </>
  );
}
