/**
 * 安全性增强模块
 * 提供输入验证、命令白名单、沙箱执行等功能
 */

import { execa } from 'execa';

/**
 * 允许的命令白名单
 */
const ALLOWED_COMMANDS = new Set([
  'node',
  'python',
  'python3',
  'uv',
  'uvx',
  'npx',
  'npm',
  'yarn',
  'pnpm',
  'pip',
  'pip3',
  'cargo',
  'go',
  'java',
  'javac',
  'dotnet',
  'ruby',
  'php',
  'swift',
  'kotlinc',
  'where',
  'which',
]);

/**
 * 危险的命令参数
 */
const DANGEROUS_ARGS = [
  'rm -rf',
  'del /F',
  'format',
  'mkfs',
  'dd',
  'chmod',
  'chown',
  'sudo',
  'su',
  'curl',
  'wget',
  'eval',
  'exec',
];

/**
 * 验证命令是否安全
 */
export function validateCommand(command: string): boolean {
  const normalizedCommand = command.toLowerCase().trim();
  
  // 检查是否在白名单中
  if (!ALLOWED_COMMANDS.has(normalizedCommand)) {
    return false;
  }
  
  return true;
}

/**
 * 验证参数是否安全
 */
export function validateArgs(args: string[]): boolean {
  for (const arg of args) {
    const normalizedArg = arg.toLowerCase();
    
    // 检查是否包含危险参数
    for (const dangerous of DANGEROUS_ARGS) {
      if (normalizedArg.includes(dangerous)) {
        return false;
      }
    }
    
    // 检查是否包含 shell 注入字符
    if (/[;&|`$(){}]/.test(arg)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 安全地执行命令
 */
export async function safeExec(
  command: string,
  args: string[],
  options?: {
    timeout?: number;
    cwd?: string;
  }
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  // 验证命令
  if (!validateCommand(command)) {
    throw new Error(`Command not allowed: ${command}`);
  }
  
  // 验证参数
  if (!validateArgs(args)) {
    throw new Error(`Dangerous arguments detected`);
  }
  
  try {
    const { stdout, stderr, exitCode } = await execa(command, args, {
      timeout: options?.timeout || 30000,
      cwd: options?.cwd,
      reject: false,
    });
    
    return { stdout, stderr, exitCode: exitCode || 0 };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 验证文件路径是否安全
 */
export function validatePath(filePath: string): boolean {
  // 检查是否尝试访问敏感目录
  const sensitivePaths = [
    '/etc/',
    '/etc/passwd',
    '/etc/shadow',
    '/root/',
    '/home/',
    'C:\\Windows\\',
    'C:\\Program Files\\',
    'C:\\Users\\',
    '/Users/',
    '/var/',
    '/proc/',
    '/sys/',
  ];
  
  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
  
  for (const sensitive of sensitivePaths) {
    if (normalizedPath.includes(sensitive.toLowerCase())) {
      return false;
    }
  }
  
  return true;
}

/**
 * 清理用户输入
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[;&|`$(){}]/g, '')  // 移除 shell 特殊字符
    .replace(/\.\.\//g, '')        // 移除路径遍历
    .replace(/\.\.\\/g, '')        // 移除 Windows 路径遍历
    .substring(0, 1000);           // 限制长度
}

/**
 * 安全检查结果
 */
export interface SecurityCheckResult {
  safe: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * 检查 MCP 服务器配置的安全性
 */
export function checkServerSecurity(config: {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}): SecurityCheckResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // 检查命令
  if (config.command && !validateCommand(config.command)) {
    issues.push(`Command "${config.command}" is not in the allowed list`);
    suggestions.push('Use only trusted commands');
  }
  
  // 检查参数
  if (config.args && !validateArgs(config.args)) {
    issues.push('Dangerous arguments detected');
    suggestions.push('Remove dangerous arguments');
  }
  
  // 检查环境变量
  if (config.env) {
    for (const [key, value] of Object.entries(config.env)) {
      if (value.includes('$') || value.includes('`')) {
        issues.push(`Environment variable ${key} contains shell expansion`);
        suggestions.push(`Remove shell expansion from ${key}`);
      }
    }
  }
  
  // 检查工作目录
  if (config.cwd && !validatePath(config.cwd)) {
    issues.push('Working directory points to sensitive location');
    suggestions.push('Use a safe working directory');
  }
  
  return {
    safe: issues.length === 0,
    issues,
    suggestions,
  };
}
