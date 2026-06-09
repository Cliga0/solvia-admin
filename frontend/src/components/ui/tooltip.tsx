"use client";

import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = Tooltip.Provider;

const TooltipRoot = Tooltip.Root;

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <Tooltip.Trigger ref={ref} className={cn("outline-none", className)} {...props}>
    {children}
  </Tooltip.Trigger>
));
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", sideOffset = 4, children, ...props }, ref) => (
    <Tooltip.Portal>
      <Tooltip.Positioner side={side} sideOffset={sideOffset} className="z-50">
        <Tooltip.Popup
          ref={ref}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        >
          {children}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  )
);
TooltipContent.displayName = "TooltipContent";

const SimpleTooltip = React.forwardRef<
  HTMLDivElement,
  { content: React.ReactNode; children: React.ReactNode } & Omit<TooltipContentProps, "children">
>(({ content, children, ...props }, ref) => (
  <TooltipRoot>
    <TooltipTrigger>{children}</TooltipTrigger>
    <TooltipContent ref={ref} {...props}>
      {content}
    </TooltipContent>
  </TooltipRoot>
));
SimpleTooltip.displayName = "SimpleTooltip";

export {
  TooltipProvider,
  TooltipRoot as Tooltip,
  TooltipTrigger,
  TooltipContent,
  SimpleTooltip,
};
