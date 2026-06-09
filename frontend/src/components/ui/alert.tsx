import { cn } from "@/lib/utils";
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Info, Circle as XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const alertVariants = cva("relative w-full rounded-lg border p-4", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
      success: "border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600",
      warning: "border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600",
      destructive: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconMap = {
  default: null,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: boolean;
}

export function Alert({ className, variant = "default", icon = true, children, ...props }: AlertProps) {
  const IconComponent = variant ? iconMap[variant] : null;

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && IconComponent && <IconComponent className="h-4 w-4" />}
      <div className={cn(icon && IconComponent && "ml-3")}>{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}
