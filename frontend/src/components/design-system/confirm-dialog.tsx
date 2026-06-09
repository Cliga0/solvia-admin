"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert as AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type ConfirmVariant = "danger" | "warning" | "default";

interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  trigger?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ConfirmVariant, { icon: React.ReactNode; buttonVariant: "default" | "destructive" | "outline" }> = {
  danger: {
    icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
    buttonVariant: "destructive",
  },
  warning: {
    icon: <ShieldAlert className="h-6 w-6 text-warning-600" />,
    buttonVariant: "outline",
  },
  default: {
    icon: null,
    buttonVariant: "default",
  },
};

export function ConfirmDialog({
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
  trigger,
  className,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const styles = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          {styles.icon && (
            <div className="mx-auto sm:mx-0 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              {styles.icon}
            </div>
          )}
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={styles.buttonVariant} onClick={handleConfirm} disabled={loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  trigger?: React.ReactNode;
}

export function DeleteConfirmDialog({
  itemName,
  itemType = "item",
  ...props
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      variant="danger"
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
    />
  );
}

interface DeactivateConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userName: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  trigger?: React.ReactNode;
}

export function DeactivateConfirmDialog({
  userName,
  ...props
}: DeactivateConfirmDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      variant="warning"
      title="Deactivate User"
      description={`Are you sure you want to deactivate "${userName}"? They will lose access immediately.`}
      confirmLabel="Deactivate"
    />
  );
}
