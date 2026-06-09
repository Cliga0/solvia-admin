"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

const PopoverRoot = Popover.Root;

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <Popover.Trigger ref={ref} className={cn("outline-none", className)} {...props}>
    {children}
  </Popover.Trigger>
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
  }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <Popover.Portal>
    <Popover.Positioner align={align} sideOffset={sideOffset} className="z-50">
      <Popover.Popup
        ref={ref}
        className={cn(
          "min-w-[8rem] overflow-hidden rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </Popover.Positioner>
  </Popover.Portal>
));
PopoverContent.displayName = "PopoverContent";

export { PopoverRoot as Popover, PopoverTrigger, PopoverContent };
