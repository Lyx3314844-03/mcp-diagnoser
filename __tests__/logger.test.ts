/**
 * Logger 单元测试
 */

import { Logger, LoggerOptions } from '../../utils/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger = new Logger({ module: 'test', level: 'debug' });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create logger with default options', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger).toBeDefined();
    });

    it('should create logger with custom options', () => {
      const customLogger = new Logger({
        level: 'error',
        module: 'custom',
        jsonOutput: true,
      });
      expect(customLogger).toBeDefined();
    });
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Warn message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should respect log level filtering', () => {
      const errorOnlyLogger = new Logger({ module: 'test', level: 'error' });
      errorOnlyLogger.debug('Should not appear');
      errorOnlyLogger.info('Should not appear');
      errorOnlyLogger.warn('Should not appear');
      errorOnlyLogger.error('Should appear');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('data logging', () => {
    it('should log additional data', () => {
      const data = { key: 'value', number: 42 };
      logger.info('Message with data', data);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('wrap function', () => {
    it('should successfully execute wrapped function', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await logger.wrap(fn, 'test operation');
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const fn = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary error');
        }
        return 'success';
      });

      const result = await logger.wrap(fn, 'retry operation', { retry: 3 });
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should use fallback after all retries fail', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      const fallback = 'fallback value';

      const result = await logger.wrap(fn, 'failing operation', {
        retry: 2,
        fallback,
      });

      expect(result).toBe(fallback);
    });

    it('should throw error when no fallback and all retries fail', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        logger.wrap(fn, 'failing operation', { retry: 2 })
      ).rejects.toThrow('Always fails');
    });
  });

  describe('buffer management', () => {
    it('should store logs in buffer', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      
      const buffer = logger.getBuffer();
      expect(buffer.length).toBe(2);
    });

    it('should clear buffer', () => {
      logger.info('Message 1');
      logger.clearBuffer();
      
      const buffer = logger.getBuffer();
      expect(buffer.length).toBe(0);
    });
  });

  describe('child logger', () => {
    it('should create child logger with correct module name', () => {
      const child = logger.child('submodule');
      child.info('Child message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('test:submodule');
    });

    it('should inherit options from parent', () => {
      const parent = new Logger({
        level: 'warn',
        module: 'parent',
        jsonOutput: true,
      });
      const child = parent.child('child');
      
      child.warn('Test');
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('parent:child');
    });
  });

  describe('JSON output', () => {
    it('should output in JSON format when enabled', () => {
      const jsonLogger = new Logger({ module: 'test', jsonOutput: true });
      jsonLogger.info('JSON message');
      
      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('JSON message');
      expect(parsed.module).toBe('test');
    });
  });
});
