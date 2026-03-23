/**
 * 增强的日志系统
 * 支持多级日志、结构化输出、文件记录
 */

import chalk from 'chalk';
import { appendFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerOptions {
  level?: LogLevel;
  module?: string;
  logToFile?: boolean;
  logFilePath?: string;
  jsonOutput?: boolean;
}

export class Logger {
  private level: LogLevel;
  private module: string;
  private logToFile: boolean;
  private logFilePath?: string;
  private jsonOutput: boolean;
  private logBuffer: LogEntry[] = [];

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.module = options.module || 'main';
    this.logToFile = options.logToFile || false;
    this.logFilePath = options.logFilePath;
    this.jsonOutput = options.jsonOutput || false;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.level];
  }

  private createEntry(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      module: this.module,
      message,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
  }

  private formatEntry(entry: LogEntry): string {
    if (this.jsonOutput) {
      return JSON.stringify(entry);
    }

    const time = chalk.gray(entry.timestamp);
    const level = this.formatLevel(entry.level);
    const module = chalk.cyan(entry.module);
    const message = entry.message;

    let output = `${time} [${level}] ${module}: ${message}`;

    if (entry.data) {
      output += '\n' + chalk.gray(JSON.stringify(entry.data, null, 2));
    }

    if (entry.error) {
      output += '\n' + chalk.red(`Error: ${entry.error.message}`);
      if (entry.error.stack) {
        output += '\n' + chalk.gray(entry.error.stack);
      }
    }

    return output;
  }

  private formatLevel(level: LogLevel): string {
    const colors: Record<LogLevel, (str: string) => string> = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
    };
    return colors[level](level.toUpperCase());
  }

  private async write(entry: LogEntry) {
    // 保存到缓冲区
    this.logBuffer.push(entry);

    // 输出到控制台
    if (this.shouldLog(entry.level)) {
      console.log(this.formatEntry(entry));
    }

    // 写入文件
    if (this.logToFile && this.logFilePath) {
      try {
        // 确保目录存在
        const dir = dirname(this.logFilePath);
        await mkdir(dir, { recursive: true });
        // 追加写入日志
        await appendFile(this.logFilePath, JSON.stringify(entry) + '\n', 'utf-8');
      } catch (error) {
        // 文件写入失败不影响控制台输出
        console.error('Failed to write log to file:', error);
      }
    }
  }

  debug(message: string, data?: any) {
    this.write(this.createEntry('debug', message, data));
  }

  info(message: string, data?: any) {
    this.write(this.createEntry('info', message, data));
  }

  warn(message: string, data?: any, error?: Error) {
    this.write(this.createEntry('warn', message, data, error));
  }

  error(message: string, error?: Error, data?: any) {
    this.write(this.createEntry('error', message, data, error));
  }

  /**
   * 包装一个 Promise 或函数，自动记录错误
   */
  async wrap<T>(
    fn: () => Promise<T> | T,
    context: string,
    options?: {
      retry?: number;
      fallback?: T;
    }
  ): Promise<T> {
    const retry = options?.retry || 0;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        this.debug(`Executing ${context}`, { attempt: attempt + 1, maxAttempts: retry + 1 });
        const result = await fn();
        this.debug(`Completed ${context}`, { success: true });
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.warn(
          `Failed executing ${context}`,
          { attempt: attempt + 1, remaining: retry - attempt },
          lastError
        );

        if (attempt < retry) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // 所有重试失败
    const finalError = lastError || new Error('Unknown error');
    this.error(
      `Failed after ${retry + 1} attempts: ${context}`,
      finalError,
      { fallback: options?.fallback }
    );

    if (options?.fallback !== undefined) {
      this.info(`Using fallback for ${context}`);
      return options.fallback;
    }

    throw finalError;
  }

  /**
   * 获取日志缓冲区
   */
  getBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * 清空日志缓冲区
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * 创建子日志器
   */
  child(module: string): Logger {
    return new Logger({
      level: this.level,
      module: `${this.module}:${module}`,
      logToFile: this.logToFile,
      logFilePath: this.logFilePath,
      jsonOutput: this.jsonOutput,
    });
  }
}

// 全局日志器实例
const globalLogger = new Logger({ module: 'mcp-diagnoser' });

export const logger = {
  debug: (message: string, data?: any) => globalLogger.debug(message, data),
  info: (message: string, data?: any) => globalLogger.info(message, data),
  warn: (message: string, data?: any, error?: Error) => globalLogger.warn(message, data, error),
  error: (message: string, error?: Error, data?: any) => globalLogger.error(message, error, data),
  child: (module: string) => globalLogger.child(module),
};

export { Logger as LoggerClass };
