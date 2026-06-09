"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { TriangleAlert as AlertTriangle, RefreshCw, Hop as Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error | null;
  onReset?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  className?: string;
  variant?: "default" | "compact" | "inline";
}

export function ErrorFallback({
  error,
  onReset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  showHomeButton = false,
  className,
  variant = "default",
}: ErrorFallbackProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-xs", className)}>
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>{error?.message || description}</span>
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-auto p-0.5 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm font-medium mb-1">{title}</p>
        <p className="text-xs text-muted-foreground text-center">{description}</p>
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} className="mt-3 h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {error?.message || description}
      </p>
      <div className="flex items-center gap-2">
        {onReset && (
          <Button onClick={onReset} className="h-8 text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try again
          </Button>
        )}
        {showHomeButton && (
          <Button variant="outline" onClick={() => window.location.href = "/"} className="h-8 text-xs">
            <Home className="h-3.5 w-3.5 mr-1.5" />
            Go home
          </Button>
        )}
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Global error caught:", error, errorInfo);
      }}
      fallback={
        <ErrorFallback
          title="Application Error"
          description="A critical error occurred. The application needs to be reloaded."
          showHomeButton
          onReset={() => window.location.reload()}
          className="min-h-screen"
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ModuleErrorBoundary({
  children,
  moduleName,
  onRetry,
}: {
  children: ReactNode;
  moduleName: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`Module [${moduleName}] error:`, error, errorInfo);
      }}
      fallback={
        <ErrorFallback
          title={`${moduleName} Error`}
          description="This section encountered an error."
          onReset={onRetry}
          variant="compact"
          className="min-h-[200px]"
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ApiErrorBoundary({
  children,
  onRetry,
  className,
}: {
  children: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error("API error:", error);
      }}
      fallback={
        <ErrorFallback
          title="Failed to load data"
          description="There was a problem fetching the data. Please check your connection and try again."
          onReset={onRetry}
          variant="compact"
          className={className}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
