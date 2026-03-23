/**
 * MCP 配置诊断测试
 */

import { MCPDiagnoser } from '../../core/diagnoser';
import type { MCPConfig, MCPServerConfig } from '../../core/diagnoser';

describe('MCPDiagnoser - Configuration', () => {
  let diagnoser: MCPDiagnoser;

  beforeEach(() => {
    diagnoser = new MCPDiagnoser('.mcp.json');
  });

  describe('diagnoseServer', () => {
    it('should handle HTTP-type servers without command', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'test-http': {
            url: 'http://example.com/mcp',
            type: 'http',
          } as MCPServerConfig,
        },
      };

      const result = await diagnoser.diagnoseServer('test-http', config, true);

      expect(result.status).toBe('ok');
      expect(result.runtime).toBe('http');
      expect(result.issues).toHaveLength(0);
    });

    it('should handle stdio-type servers with command', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'test-stdio': {
            command: 'node',
            args: ['test.js'],
            type: 'stdio',
          },
        },
      };

      const result = await diagnoser.diagnoseServer('test-stdio', config, true);

      expect(result.status).toBe('ok');
      expect(result.runtime).toBe('node');
    });

    it('should handle Python-type servers', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'test-python': {
            command: 'uv',
            args: ['run', 'test.py'],
            type: 'stdio',
          },
        },
      };

      const result = await diagnoser.diagnoseServer('test-python', config, true);

      expect(result.status).toBe('ok');
      expect(result.runtime).toBe('python');
    });

    it('should return unknown status for non-existent server', async () => {
      const config: MCPConfig = {
        mcpServers: {},
      };

      const result = await diagnoser.diagnoseServer('non-existent', config);

      expect(result.status).toBe('unknown');
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('diagnoseAll', () => {
    it('should diagnose all servers in parallel', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'server-1': {
            url: 'http://example1.com/mcp',
            type: 'http',
          } as MCPServerConfig,
          'server-2': {
            url: 'http://example2.com/mcp',
            type: 'http',
          } as MCPServerConfig,
          'server-3': {
            command: 'node',
            args: ['test.js'],
            type: 'stdio',
          },
        },
      };

      const startTime = Date.now();
      const report = await diagnoser.diagnoseAll(config, true);
      const duration = Date.now() - startTime;

      // Should complete quickly with fast mode
      expect(duration).toBeLessThan(1000);
      expect(report.servers.length).toBe(3);
      expect(report.summary.total).toBe(3);
    });

    it('should handle mixed server types', async () => {
      const config: MCPConfig = {
        mcpServers: {
          http: {
            url: 'http://example.com/mcp',
          } as MCPServerConfig,
          node: {
            command: 'node',
            args: ['app.js'],
          },
          python: {
            command: 'python',
            args: ['app.py'],
          },
          uv: {
            command: 'uv',
            args: ['run', 'app.py'],
          },
        },
      };

      const report = await diagnoser.diagnoseAll(config, true);

      expect(report.servers.length).toBe(4);
      
      const httpServer = report.servers.find((s: any) => s.name === 'http');
      expect(httpServer?.runtime).toBe('http');
      
      const nodeServer = report.servers.find((s: any) => s.name === 'node');
      expect(nodeServer?.runtime).toBe('node');
    });
  });

  describe('runtime detection', () => {
    it('should detect Node.js runtime', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'node-server': {
            command: 'node',
            args: ['server.js'],
          },
        },
      };

      const result = await diagnoser.diagnoseServer('node-server', config, true);
      expect(result.runtime).toBe('node');
    });

    it('should detect Python runtime', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'python-server': {
            command: 'python',
            args: ['server.py'],
          },
        },
      };

      const result = await diagnoser.diagnoseServer('python-server', config, true);
      expect(result.runtime).toBe('python');
    });

    it('should detect uv runtime', async () => {
      const config: MCPConfig = {
        mcpServers: {
          'uv-server': {
            command: 'uv',
            args: ['run', 'server.py'],
          },
        },
      };

      const result = await diagnoser.diagnoseServer('uv-server', config, true);
      expect(result.runtime).toBe('python');
    });
  });
});
