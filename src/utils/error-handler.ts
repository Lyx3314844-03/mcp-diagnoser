/**
 * 增强的错误处理系统
 * 提供详细的错误信息和修复建议
 */

export enum ErrorCategory {
  INSTALLATION = 'installation',
  CONFIGURATION = 'configuration',
  RUNTIME = 'runtime',
  NETWORK = 'network',
  PERMISSION = 'permission',
  DEPENDENCY = 'dependency',
  PACKAGE = 'package',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface DiagnosticErrorOptions {
  message: string;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  cause?: Error;
  details?: Record<string, any>;
  suggestion?: string;
  command?: string;
  documentation?: string;
}

export class DiagnosticError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly cause?: Error;
  public readonly details: Record<string, any>;
  public readonly suggestion?: string;
  public readonly command?: string;
  public readonly documentation?: string;
  public readonly timestamp: string;
  public readonly code: string;

  constructor(code: string, options: DiagnosticErrorOptions) {
    super(options.message);
    this.name = 'DiagnosticError';
    this.code = code;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.cause = options.cause;
    this.details = options.details || {};
    this.suggestion = options.suggestion;
    this.command = options.command;
    this.documentation = options.documentation;
    this.timestamp = new Date().toISOString();
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      details: this.details,
      suggestion: this.suggestion,
      command: this.command,
      documentation: this.documentation,
      timestamp: this.timestamp,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
      } : undefined,
    };
  }

  /**
   * 创建安装错误
   */
  static installation(message: string, details?: { command?: string; packageName?: string }): DiagnosticError {
    return new DiagnosticError('ERR_INSTALLATION', {
      message,
      category: ErrorCategory.INSTALLATION,
      severity: ErrorSeverity.HIGH,
      details,
      suggestion: '检查包是否正确安装，或尝试重新安装',
      command: details?.command,
    });
  }

  /**
   * 创建配置错误
   */
  static configuration(message: string, details?: { field?: string; value?: any }): DiagnosticError {
    return new DiagnosticError('ERR_CONFIGURATION', {
      message,
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.HIGH,
      details,
      suggestion: '检查配置文件格式和字段',
    });
  }

  /**
   * 创建运行时错误
   */
  static runtime(message: string, details?: { runtime?: string; version?: string }): DiagnosticError {
    return new DiagnosticError('ERR_RUNTIME', {
      message,
      category: ErrorCategory.RUNTIME,
      severity: ErrorSeverity.HIGH,
      details,
      suggestion: '安装或更新运行时环境',
    });
  }

  /**
   * 创建网络错误
   */
  static network(message: string, details?: { url?: string; statusCode?: number }): DiagnosticError {
    return new DiagnosticError('ERR_NETWORK', {
      message,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      details,
      suggestion: '检查网络连接或代理设置',
    });
  }

  /**
   * 创建权限错误
   */
  static permission(message: string, details?: { path?: string; operation?: string }): DiagnosticError {
    return new DiagnosticError('ERR_PERMISSION', {
      message,
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.HIGH,
      details,
      suggestion: '以管理员身份运行或检查文件权限',
    });
  }

  /**
   * 创建依赖错误
   */
  static dependency(message: string, details?: { package?: string; requiredBy?: string }): DiagnosticError {
    return new DiagnosticError('ERR_DEPENDENCY', {
      message,
      category: ErrorCategory.DEPENDENCY,
      severity: ErrorSeverity.MEDIUM,
      details,
      suggestion: '安装缺失的依赖或解决版本冲突',
    });
  }

  /**
   * 创建包错误
   */
  static package(message: string, details?: { package?: string; version?: string }): DiagnosticError {
    return new DiagnosticError('ERR_PACKAGE', {
      message,
      category: ErrorCategory.PACKAGE,
      severity: ErrorSeverity.MEDIUM,
      details,
      suggestion: '检查包是否存在或版本是否正确',
    });
  }

  /**
   * 从未知错误创建 DiagnosticError
   */
  static fromError(error: unknown, context?: string): DiagnosticError {
    if (error instanceof DiagnosticError) {
      return error;
    }

    if (error instanceof Error) {
      return new DiagnosticError('ERR_UNKNOWN', {
        message: context ? `${context}: ${error.message}` : error.message,
        category: ErrorCategory.UNKNOWN,
        cause: error,
        details: {
          name: error.name,
          stack: error.stack,
        },
      });
    }

    return new DiagnosticError('ERR_UNKNOWN', {
      message: context ? `${context}: ${String(error)}` : String(error),
      category: ErrorCategory.UNKNOWN,
    });
  }
}

/**
 * 错误恢复策略
 */
export interface RecoveryStrategy {
  name: string;
  description: string;
  canRecover: (error: DiagnosticError) => boolean;
  recover: (error: DiagnosticError) => Promise<boolean>;
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = [];

  /**
   * 注册恢复策略
   */
  register(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * 尝试恢复错误
   */
  async attemptRecovery(error: DiagnosticError): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          const success = await strategy.recover(error);
          if (success) {
            return true;
          }
        } catch (recoveryError) {
          // 恢复失败，继续尝试下一个策略
        }
      }
    }
    return false;
  }
}

// 预定义的恢复策略
export const defaultRecoveryStrategies: RecoveryStrategy[] = [
  {
    name: 'retry',
    description: '重试操作',
    canRecover: (error) => error.category === ErrorCategory.NETWORK,
    recover: async () => {
      // 实际实现中会重试操作
      return true;
    },
  },
  {
    name: 'fallback-to-cache',
    description: '使用缓存数据',
    canRecover: (error) => error.category === ErrorCategory.NETWORK || error.category === ErrorCategory.INSTALLATION,
    recover: async () => {
      // 实际实现中会返回缓存数据
      return true;
    },
  },
];
