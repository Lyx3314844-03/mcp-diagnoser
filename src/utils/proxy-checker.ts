/**
 * 代理检测和配置模块
 * 支持 VPN/代理服务器检测、测试和配置
 */

import { execa } from 'execa';
import chalk from 'chalk';
import https from 'https';
import { HttpsProxyAgent } from 'hpagent';
import { Socket } from 'net';

export interface ProxyConfig {
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface ProxyTestResult {
  success: boolean;
  responseTime?: number;
  externalIp?: string;
  country?: string;
  error?: string;
  proxyConfig?: ProxyConfig;
}

export interface SystemProxyConfig {
  httpProxy?: string;
  httpsProxy?: string;
  socksProxy?: string;
  noProxy?: string;
  autoDetect?: boolean;
  pacUrl?: string;
}

export class ProxyChecker {
  private testUrls = {
    google: 'https://www.google.com',
    bing: 'https://www.bing.com',
    ip138: 'https://www.ip138.com',
    whatismyip: 'https://api.ipify.org?format=json',
  };

  /**
   * 检测系统代理配置
   */
  async detectSystemProxy(): Promise<SystemProxyConfig> {
    const config: SystemProxyConfig = {
      httpProxy: process.env.HTTP_PROXY || process.env.http_proxy,
      httpsProxy: process.env.HTTPS_PROXY || process.env.https_proxy,
      socksProxy: process.env.SOCKS_PROXY || process.env.socks_proxy,
      noProxy: process.env.NO_PROXY || process.env.no_proxy,
    };

    // Windows: 检测注册表
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execa('reg', [
          'query',
          'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
          '/v',
          'ProxyEnable',
        ], { timeout: 5000 });

        if (stdout.includes('0x1')) {
          config.autoDetect = true;

          // 获取代理服务器地址
          const proxyResult = await execa('reg', [
            'query',
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
            '/v',
            'ProxyServer',
          ], { timeout: 5000 });

          if (proxyResult.stdout) {
            const match = proxyResult.stdout.match(/ProxyServer\s+REG_SZ\s+(.+)/);
            if (match && match[1]) {
              config.httpProxy = match[1];
              config.httpsProxy = match[1];
            }
          }
        }
      } catch (error) {
        // 注册表检测失败，忽略
      }
    }

    // macOS: 检测网络配置
    if (process.platform === 'darwin') {
      try {
        const { stdout } = await execa('scutil', ['--proxy'], { timeout: 5000 });
        
        if (stdout.includes('Enable : 1')) {
          config.autoDetect = true;
          
          const httpMatch = stdout.match(/HTTPProxy : (.+)/);
          const portMatch = stdout.match(/HTTPPort : (\d+)/);
          if (httpMatch && portMatch) {
            config.httpProxy = `${httpMatch[1]}:${portMatch[1]}`;
          }
        }
      } catch (error) {
        // macOS 检测失败，忽略
      }
    }

    // Linux: 检测 gsettings
    if (process.platform === 'linux') {
      try {
        const { stdout } = await execa('gsettings', [
          'get',
          'org.gnome.system.proxy',
          'mode',
        ], { timeout: 5000 });

        if (stdout.includes('manual') || stdout.includes('auto')) {
          config.autoDetect = true;
        }
      } catch (error) {
        // Linux 检测失败，忽略
      }
    }

    return config;
  }

  /**
   * 测试代理连接
   */
  async testProxy(
    proxyConfig: ProxyConfig,
    targetUrl: string = this.testUrls.google
  ): Promise<ProxyTestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const proxyAuth = proxyConfig.username && proxyConfig.password
        ? `${proxyConfig.username}:${proxyConfig.password}@`
        : '';

      const proxyUrl = `${proxyConfig.protocol}://${proxyAuth}${proxyConfig.host}:${proxyConfig.port}`;

      const agent = new HttpsProxyAgent({
        proxy: proxyUrl,
      });

      const options = {
        hostname: targetUrl.replace('https://', '').replace('http://', '').split('/')[0],
        port: 443,
        path: '/',
        method: 'GET',
        agent: agent,
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode === 200) {
          resolve({
            success: true,
            responseTime,
            proxyConfig,
          });
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}`,
            proxyConfig,
          });
        }
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          proxyConfig,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout',
          proxyConfig,
        });
      });

      req.end();
    });
  }

  /**
   * 测试是否能访问 Google
   */
  async testGoogle(proxyConfig?: ProxyConfig): Promise<ProxyTestResult> {
    if (proxyConfig) {
      return this.testProxy(proxyConfig, this.testUrls.google);
    }

    // 无代理直接测试
    return this.testDirectConnection(this.testUrls.google);
  }

  /**
   * 测试是否能访问 Bing
   */
  async testBing(proxyConfig?: ProxyConfig): Promise<ProxyTestResult> {
    if (proxyConfig) {
      return this.testProxy(proxyConfig, this.testUrls.bing);
    }

    return this.testDirectConnection(this.testUrls.bing);
  }

  /**
   * 测试直接连接（不使用代理）
   */
  private async testDirectConnection(url: string): Promise<ProxyTestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const req = https.get(url, { timeout: 10000 }, (res) => {
        const responseTime = Date.now() - startTime;
        
        resolve({
          success: res.statusCode === 200,
          responseTime,
          error: res.statusCode !== 200 ? `HTTP ${res.statusCode}` : undefined,
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout',
        });
      });
    });
  }

  /**
   * 获取外部 IP 地址
   */
  async getExternalIp(proxyConfig?: ProxyConfig): Promise<string | undefined> {
    try {
      const url = this.testUrls.whatismyip;
      
      if (proxyConfig) {
        // 通过代理获取
        const response = await this.fetchWithProxy(url, proxyConfig);
        const data = JSON.parse(response);
        return data.ip;
      } else {
        // 直接获取
        const response = await new Promise<string>((resolve, reject) => {
          https.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
          }).on('error', reject);
        });
        
        const data = JSON.parse(response);
        return data.ip;
      }
    } catch (error) {
      return undefined;
    }
  }

  /**
   * 通过代理获取 URL
   */
  private async fetchWithProxy(url: string, proxyConfig: ProxyConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      const proxyAuth = proxyConfig.username && proxyConfig.password
        ? `${proxyConfig.username}:${proxyConfig.password}@`
        : '';

      const proxyUrl = `${proxyConfig.protocol}://${proxyAuth}${proxyConfig.host}:${proxyConfig.port}`;

      const agent = new HttpsProxyAgent({
        proxy: proxyUrl,
      });

      const options = {
        hostname: url.replace('https://', '').split('/')[0],
        port: 443,
        path: '/',
        method: 'GET',
        agent: agent,
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * 扫描常见代理端口
   */
  async scanCommonPorts(host: string): Promise<number[]> {
    const commonPorts = [
      7890, // Clash
      7891, // Clash
      1080, // SOCKS
      10808, // SOCKS
      8080, // HTTP
      8888, // HTTP
      9090, // HTTP
      2333, // V2Ray
      10809, // SOCKS
    ];

    const openPorts: number[] = [];

    for (const port of commonPorts) {
      const isOpen = await this.testPort(host, port);
      if (isOpen) {
        openPorts.push(port);
      }
    }

    return openPorts;
  }

  /**
   * 测试端口是否开放
   */
  private async testPort(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 1000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  /**
   * 生成代理配置字符串（用于 curl 等工具）
   */
  formatProxyConfig(proxyConfig: ProxyConfig): string {
    const auth = proxyConfig.username && proxyConfig.password
      ? `${proxyConfig.username}:${proxyConfig.password}@`
      : '';

    return `${proxyConfig.protocol}://${auth}${proxyConfig.host}:${proxyConfig.port}`;
  }

  /**
   * 设置环境变量代理
   */
  setEnvironmentProxy(proxyConfig: ProxyConfig): void {
    const proxyUrl = this.formatProxyConfig(proxyConfig);
    
    process.env.HTTP_PROXY = proxyUrl;
    process.env.HTTPS_PROXY = proxyUrl;
    process.env.http_proxy = proxyUrl;
    process.env.https_proxy = proxyUrl;
  }

  /**
   * 清除环境变量代理
   */
  clearEnvironmentProxy(): void {
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    delete process.env.SOCKS_PROXY;
    delete process.env.socks_proxy;
  }
}

// 导出单例
export const proxyChecker = new ProxyChecker();
