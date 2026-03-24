/**
 * DiagnosticError 单元测试
 */

import {
  DiagnosticError,
  ErrorCategory,
  ErrorSeverity,
  ErrorRecoveryManager,
} from '../../utils/error-handler';

describe('DiagnosticError', () => {
  describe('constructor', () => {
    it('should create error with basic options', () => {
      const error = new DiagnosticError('TEST_ERROR', {
        message: 'Test error message',
      });

      expect(error.name).toBe('DiagnosticError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.category).toBe(ErrorCategory.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should create error with all options', () => {
      const cause = new Error('Cause error');
      const error = new DiagnosticError('FULL_ERROR', {
        message: 'Full error',
        category: ErrorCategory.INSTALLATION,
        severity: ErrorSeverity.CRITICAL,
        cause,
        details: { package: 'test-pkg' },
        suggestion: 'Install the package',
        command: 'npm install test-pkg',
        documentation: 'https://example.com/docs',
      });

      expect(error.category).toBe(ErrorCategory.INSTALLATION);
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.cause).toBe(cause);
      expect(error.details).toEqual({ package: 'test-pkg' });
      expect(error.suggestion).toBe('Install the package');
      expect(error.command).toBe('npm install test-pkg');
    });
  });

  describe('toJSON', () => {
    it('should convert error to JSON', () => {
      const error = new DiagnosticError('JSON_ERROR', {
        message: 'JSON test',
        category: ErrorCategory.CONFIGURATION,
        details: { field: 'value' },
      });

      const json = error.toJSON();

      expect(json.name).toBe('DiagnosticError');
      expect(json.code).toBe('JSON_ERROR');
      expect(json.message).toBe('JSON test');
      expect(json.category).toBe('configuration');
      expect(json.details).toEqual({ field: 'value' });
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('static factory methods', () => {
    it('should create installation error', () => {
      const error = DiagnosticError.installation('Package not found', {
        packageName: 'test-pkg',
      });

      expect(error.category).toBe(ErrorCategory.INSTALLATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.details.packageName).toBe('test-pkg');
    });

    it('should create configuration error', () => {
      const error = DiagnosticError.configuration('Invalid config', {
        field: 'port',
        value: 8080,
      });

      expect(error.category).toBe(ErrorCategory.CONFIGURATION);
      expect(error.details.field).toBe('port');
    });

    it('should create runtime error', () => {
      const error = DiagnosticError.runtime('Node.js not found', {
        runtime: 'node',
        version: '18.0.0',
      });

      expect(error.category).toBe(ErrorCategory.RUNTIME);
      expect(error.details.runtime).toBe('node');
    });

    it('should create network error', () => {
      const error = DiagnosticError.network('Connection failed', {
        url: 'https://example.com',
        statusCode: 404,
      });

      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.details.url).toBe('https://example.com');
    });

    it('should create permission error', () => {
      const error = DiagnosticError.permission('Access denied', {
        path: '/usr/local/bin',
        operation: 'write',
      });

      expect(error.category).toBe(ErrorCategory.PERMISSION);
      expect(error.details.path).toBe('/usr/local/bin');
    });

    it('should create dependency error', () => {
      const error = DiagnosticError.dependency('Missing dependency', {
        package: 'react',
        requiredBy: 'react-dom',
      });

      expect(error.category).toBe(ErrorCategory.DEPENDENCY);
    });

    it('should create package error', () => {
      const error = DiagnosticError.package('Package corrupted', {
        package: 'test-pkg',
        version: '1.0.0',
      });

      expect(error.category).toBe(ErrorCategory.PACKAGE);
    });
  });

  describe('fromError', () => {
    it('should convert Error to DiagnosticError', () => {
      const originalError = new Error('Original error');
      const diagnosticError = DiagnosticError.fromError(originalError);

      expect(diagnosticError.code).toBe('ERR_UNKNOWN');
      expect(diagnosticError.message).toBe('Original error');
      expect(diagnosticError.cause).toBe(originalError);
    });

    it('should add context to error', () => {
      const originalError = new Error('Original error');
      const diagnosticError = DiagnosticError.fromError(
        originalError,
        'During installation'
      );

      expect(diagnosticError.message).toBe(
        'During installation: Original error'
      );
    });

    it('should handle non-Error objects', () => {
      const diagnosticError = DiagnosticError.fromError('String error');

      expect(diagnosticError.message).toBe('String error');
    });

    it('should pass through DiagnosticError', () => {
      const original = DiagnosticError.installation('Test');
      const result = DiagnosticError.fromError(original);

      expect(result).toBe(original);
    });
  });
});

describe('ErrorRecoveryManager', () => {
  let recoveryManager: ErrorRecoveryManager;

  beforeEach(() => {
    recoveryManager = new ErrorRecoveryManager();
  });

  describe('register', () => {
    it('should register recovery strategy', () => {
      const strategy = {
        name: 'test-strategy',
        description: 'Test strategy',
        canRecover: jest.fn().mockReturnValue(false),
        recover: jest.fn(),
      };

      recoveryManager.register(strategy);

      expect(() => {
        recoveryManager.register(strategy);
      }).not.toThrow();
    });
  });

  describe('attemptRecovery', () => {
    it('should try matching strategies', async () => {
      const canRecover = jest.fn().mockReturnValue(true);
      const recover = jest.fn().mockResolvedValue(true);

      recoveryManager.register({
        name: 'test',
        description: 'test',
        canRecover,
        recover,
      });

      const error = DiagnosticError.network('Test error');
      const result = await recoveryManager.attemptRecovery(error);

      expect(canRecover).toHaveBeenCalledWith(error);
      expect(recover).toHaveBeenCalledWith(error);
      expect(result).toBe(true);
    });

    it('should return false if no strategy can recover', async () => {
      const strategy = {
        name: 'test',
        description: 'test',
        canRecover: jest.fn().mockReturnValue(false),
        recover: jest.fn(),
      };

      recoveryManager.register(strategy);

      const error = DiagnosticError.network('Test error');
      const result = await recoveryManager.attemptRecovery(error);

      expect(result).toBe(false);
      expect(strategy.recover).not.toHaveBeenCalled();
    });

    it('should continue to next strategy if current fails', async () => {
      const strategy1 = {
        name: 'test1',
        description: 'test1',
        canRecover: jest.fn().mockReturnValue(true),
        recover: jest.fn().mockRejectedValue(new Error('Recovery failed')),
      };

      const strategy2 = {
        name: 'test2',
        description: 'test2',
        canRecover: jest.fn().mockReturnValue(true),
        recover: jest.fn().mockResolvedValue(true),
      };

      recoveryManager.register(strategy1);
      recoveryManager.register(strategy2);

      const error = DiagnosticError.network('Test error');
      const result = await recoveryManager.attemptRecovery(error);

      expect(result).toBe(true);
      expect(strategy2.recover).toHaveBeenCalled();
    });
  });
});
