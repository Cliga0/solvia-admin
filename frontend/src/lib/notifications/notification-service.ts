import { toast, type ExternalToast } from "sonner";

export type NotificationVariant = "default" | "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: ExternalToast["action"];
  cancel?: ExternalToast["cancel"];
}

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;

export const notification = {
  success: (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration ?? DEFAULT_DURATION,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  error: (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration ?? ERROR_DURATION,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  warning: (message: string, options?: NotificationOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? DEFAULT_DURATION,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  info: (message: string, options?: NotificationOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration ?? DEFAULT_DURATION,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  default: (message: string, options?: NotificationOptions) => {
    toast(message, {
      description: options?.description,
      duration: options?.duration ?? DEFAULT_DURATION,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: NotificationOptions
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      description: options?.description,
    });
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

export class ApiErrorHandler {
  static handle(error: unknown, fallbackMessage = "An unexpected error occurred"): void {
    if (error instanceof Error) {
      const message = error.message || fallbackMessage;
      notification.error(message);
    } else if (typeof error === "string") {
      notification.error(error);
    } else {
      notification.error(fallbackMessage);
    }
  }

  static handleWithRetry(
    error: unknown,
    retryAction: () => void,
    fallbackMessage = "An unexpected error occurred"
  ): void {
    if (error instanceof Error) {
      const message = error.message || fallbackMessage;
      toast.error(message, {
        action: {
          label: "Retry",
          onClick: retryAction,
        },
      });
    } else {
      toast.error(fallbackMessage, {
        action: {
          label: "Retry",
          onClick: retryAction,
        },
      });
    }
  }
}

export { toast };
