/**
 * Advanced logging wrapper for tracking function execution
 */

interface LogContext {
  functionName: string;
  startTime: number;
  args: unknown[];
  result?: unknown;
  error?: Error;
  duration?: number;
}

type LogLevel = "debug" | "info" | "warn" | "error";

class FunctionLogger {
  private logs: LogContext[] = [];
  private enableConsole: boolean = true;
  private logLevel: LogLevel = "info";

  /**
   * Wraps a function with advanced logging capabilities
   */
  wrap<T extends (...args: any[]) => any>(fn: T, functionName?: string): (...args: Parameters<T>) => ReturnType<T> {
    const name = functionName || fn.name || "anonymous";

    return ((...args: Parameters<T>) => {
      const context: LogContext = {
        functionName: name,
        startTime: performance.now(),
        args,
      };

      this.logStart(context);

      try {
        const result = fn(...args);

        if (result instanceof Promise) {
          return result
            .then((resolved) => {
              context.result = resolved;
              context.duration = performance.now() - context.startTime;
              this.logSuccess(context);
              return resolved;
            })
            .catch((err) => {
              context.error = err;
              context.duration = performance.now() - context.startTime;
              this.logError(context);
              throw err;
            });
        }

        context.result = result;
        context.duration = performance.now() - context.startTime;
        this.logSuccess(context);
        return result;
      } catch (error) {
        context.error = error instanceof Error ? error : new Error(String(error));
        context.duration = performance.now() - context.startTime;
        this.logError(context);
        throw error;
      }
    }) as (...args: Parameters<T>) => ReturnType<T>;
  }

  /**
   * Wraps an async function with enhanced logging
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, functionName?: string): (...args: Parameters<T>) => ReturnType<T> {
    const name = functionName || fn.name || "anonymous";

    return (async (...args: Parameters<T>) => {
      const context: LogContext = {
        functionName: name,
        startTime: performance.now(),
        args,
      };

      this.logStart(context);

      try {
        const result = await fn(...args);
        context.result = result;
        context.duration = performance.now() - context.startTime;
        this.logSuccess(context);
        return result;
      } catch (error) {
        context.error = error instanceof Error ? error : new Error(String(error));
        context.duration = performance.now() - context.startTime;
        this.logError(context);
        throw error;
      }
    }) as (...args: Parameters<T>) => ReturnType<T>;
  }

  /**
   * Decorator for class methods
   */
  static log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const logger = new FunctionLogger();
    const originalMethod = descriptor.value;

    descriptor.value = logger.wrap(originalMethod, propertyKey);
    return descriptor;
  }

  private logStart(context: LogContext): void {
    if (this.enableConsole) {
      console.log(`%c[${context.functionName}] START`, "color: #0066cc; font-weight: bold;", { args: context.args });
    }
    this.logs.push(context);
  }

  private logSuccess(context: LogContext): void {
    if (this.enableConsole) {
      console.log(`%c[${context.functionName}] SUCCESS (${context.duration?.toFixed(2)}ms)`, "color: #00aa00; font-weight: bold;", { result: context.result });
    }
  }

  private logError(context: LogContext): void {
    if (this.enableConsole) {
      console.error(`%c[${context.functionName}] ERROR (${context.duration?.toFixed(2)}ms)`, "color: #cc0000; font-weight: bold;", { error: context.error });
    }
  }

  /**
   * Get execution history
   */
  getHistory(functionName?: string): LogContext[] {
    return functionName ? this.logs.filter((log) => log.functionName === functionName) : this.logs;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logs = [];
  }

  /**
   * Get statistics for a function
   */
  getStats(functionName: string) {
    const funcLogs = this.getHistory(functionName);
    if (funcLogs.length === 0) return null;

    const durations = funcLogs.map((log) => log.duration || 0).filter((d) => d > 0);

    return {
      callCount: funcLogs.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      errorCount: funcLogs.filter((log) => log.error).length,
    };
  }

  setEnableConsole(enable: boolean): void {
    this.enableConsole = enable;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

export const logger = new FunctionLogger();
export { FunctionLogger, type LogContext, type LogLevel };
