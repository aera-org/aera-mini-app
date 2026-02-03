type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: LogData;
  timestamp: string;
}

type LogData =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private log(level: LogLevel, message: string, data?: LogData) {
    const entry = this.createLogEntry(level, message, data);

    // Show in console in development
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(message, data);
          break;
        case 'info':
          console.info(message, data);
          break;
        case 'warn':
          console.warn(message, data);
          break;
        case 'error':
          console.error(message, data);
          break;
      }
    }

    // Save log for possible sending
    this.logs.push(entry);

    // Send important errors in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToExternalLogger(entry);
    }
  }

  private sendToExternalLogger(entry: LogEntry) {
    // Here you can add integration with Sentry, LogRocket, etc.
    // For now, just save to localStorage for debugging
    try {
      const existingLogs = localStorage.getItem('app_logs') || '[]';
      const logs = JSON.parse(existingLogs);
      logs.push(entry);

      // Keep only the last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // If we can't save the log, ignore it
    }
  }

  debug(message: string, data?: LogData) {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogData) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData) {
    this.log('warn', message, data);
  }

  error(message: string, error?: LogData) {
    this.log('error', message, error);
  }

  // Method for getting logs (useful for debugging)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Method for clearing logs
  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
