type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  path?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class FrontendLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: config?.minLevel ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
      enableConsole: config?.enableConsole ?? true,
      enableRemote: config?.enableRemote ?? false,
      remoteEndpoint: config?.remoteEndpoint,
      batchSize: config?.batchSize ?? 10,
      flushInterval: config?.flushInterval ?? 5000,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    };
  }

  private output(entry: LogEntry): void {
    if (this.config.enableConsole) {
      const formattedMessage = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;

      switch (entry.level) {
        case "debug":
          console.debug(formattedMessage, entry.context);
          break;
        case "info":
          console.info(formattedMessage, entry.context);
          break;
        case "warn":
          console.warn(formattedMessage, entry.context);
          break;
        case "error":
          console.error(formattedMessage, entry.context, entry.error);
          break;
      }
    }

    if (this.config.enableRemote) {
      this.logBuffer.push(entry);
      if (this.logBuffer.length >= (this.config.batchSize ?? 10)) {
        this.flush();
      }
    }
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.remoteEndpoint) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });
    } catch {
      console.error("Failed to send logs to remote endpoint");
    }
  }

  startFlushTimer(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;
    this.output(this.createEntry("debug", message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;
    this.output(this.createEntry("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;
    this.output(this.createEntry("warn", message, context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog("error")) return;
    this.output(this.createEntry("error", message, context, error));
  }

  apiCall(
    method: string,
    endpoint: string,
    duration: number,
    status: number,
    context?: Record<string, unknown>
  ): void {
    this.info(`API ${method} ${endpoint}`, {
      ...context,
      duration,
      status,
      type: "api_call",
    });
  }

  apiError(
    method: string,
    endpoint: string,
    error: Error,
    context?: Record<string, unknown>
  ): void {
    this.error(`API ${method} ${endpoint} failed`, error, {
      ...context,
      type: "api_error",
    });
  }

  userAction(action: string, context?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      ...context,
      type: "user_action",
    });
  }

  pageView(path: string, context?: Record<string, unknown>): void {
    this.info(`Page view: ${path}`, {
      ...context,
      type: "page_view",
    });
  }

  performance(metric: string, value: number, context?: Record<string, unknown>): void {
    this.debug(`Performance: ${metric}`, {
      ...context,
      value,
      type: "performance",
    });
  }
}

export const logger = new FrontendLogger();

export { FrontendLogger, type LogLevel, type LogEntry, type LoggerConfig };
