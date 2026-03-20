// Test all search engines availability
const https = require('https');
const http = require('http');
const { URL } = require('url');

const SEARCH_ENGINES = {
  // General Search Engines
  google: {
    name: 'Google',
    testUrl: 'https://www.google.com/search?q=test',
    description: 'Google Search - 全球最大搜索引擎',
  },
  bing: {
    name: 'Bing',
    testUrl: 'https://www.bing.com/search?q=test',
    description: 'Microsoft Bing - 微软搜索引擎',
  },
  baidu: {
    name: 'Baidu',
    testUrl: 'https://www.baidu.com/s?wd=test',
    description: '百度搜索 - 中国最大搜索引擎',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    testUrl: 'https://duckduckgo.com/?q=test',
    description: 'DuckDuckGo - 隐私保护搜索引擎',
  },
  yahoo: {
    name: 'Yahoo',
    testUrl: 'https://search.yahoo.com/search?p=test',
    description: 'Yahoo Search - 雅虎搜索引擎',
  },
  yandex: {
    name: 'Yandex',
    testUrl: 'https://yandex.com/search/?text=test',
    description: 'Yandex - 俄罗斯搜索引擎',
  },
  sogou: {
    name: 'Sogou',
    testUrl: 'https://www.sogou.com/sogou?query=test',
    description: '搜狗搜索 - 中国搜索引擎',
  },
  so360: {
    name: '360 Search',
    testUrl: 'https://www.so.com/s?q=test',
    description: '360 搜索 - 中国搜索引擎',
  },
  
  // Vertical Search
  github: {
    name: 'GitHub',
    testUrl: 'https://github.com/search?q=test',
    description: 'GitHub Code Search - 代码搜索',
  },
  stackoverflow: {
    name: 'Stack Overflow',
    testUrl: 'https://stackoverflow.com/search?q=test',
    description: 'Stack Overflow - 技术问答',
  },
  reddit: {
    name: 'Reddit',
    testUrl: 'https://www.reddit.com/search?q=test',
    description: 'Reddit - 社交新闻',
  },
  youtube: {
    name: 'YouTube',
    testUrl: 'https://www.youtube.com/results?search_query=test',
    description: 'YouTube - 视频搜索',
  },
  bilibili: {
    name: 'Bilibili',
    testUrl: 'https://search.bilibili.com/all?keyword=test',
    description: '哔哩哔哩 - 视频搜索',
  },
  scholar: {
    name: 'Google Scholar',
    testUrl: 'https://scholar.google.com/scholar?q=test',
    description: 'Google Scholar - 学术搜索',
  },
  arxiv: {
    name: 'arXiv',
    testUrl: 'https://arxiv.org/search/?query=test&searchtype=all',
    description: 'arXiv - 论文搜索',
  },
};

async function checkUrl(name, url, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout }, (res) => {
      const responseTime = Date.now() - startTime;
      
      if (res.statusCode === 200) {
        resolve({
          name,
          status: '✅ OK',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          url,
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // Redirect is OK for some engines
        resolve({
          name,
          status: '⚠️ Redirect',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          url,
          location: res.headers.location,
        });
      } else {
        resolve({
          name,
          status: '❌ Error',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          url,
        });
      }
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        name,
        status: '❌ Failed',
        statusCode: 'N/A',
        responseTime: `${responseTime}ms`,
        url,
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name,
        status: '❌ Timeout',
        statusCode: 'N/A',
        responseTime: `>${timeout}ms`,
        url,
        error: 'Request timeout',
      });
    });
  });
}

async function testAllEngines() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║        Search Engine Availability Test                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const engines = Object.entries(SEARCH_ENGINES);
  const results = [];
  
  console.log(`Testing ${engines.length} search engines...\n`);
  console.log('─'.repeat(60));
  
  // Test all engines in parallel with concurrency limit
  const concurrencyLimit = 5;
  for (let i = 0; i < engines.length; i += concurrencyLimit) {
    const batch = engines.slice(i, i + concurrencyLimit);
    const promises = batch.map(async ([key, engine]) => {
      const result = await checkUrl(engine.name, engine.testUrl);
      result.key = key;
      result.description = engine.description;
      return result;
    });
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Progress indicator
    const completed = Math.min(i + concurrencyLimit, engines.length);
    process.stdout.write(`\rProgress: ${completed}/${engines.length} engines tested...`);
  }
  
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('\n📊 TEST RESULTS\n');
  console.log('═'.repeat(60));
  
  // Group by status
  const ok = results.filter(r => r.status === '✅ OK' || r.status === '⚠️ Redirect');
  const failed = results.filter(r => r.status.startsWith('❌'));
  
  // Print OK results
  if (ok.length > 0) {
    console.log(`\n✅ AVAILABLE (${ok.length}/${engines.length}):\n`);
    console.log('─'.repeat(60));
    
    // Group by category
    const general = ok.filter(r => ['google', 'bing', 'baidu', 'duckduckgo', 'yahoo', 'yandex', 'sogou', 'so360'].includes(r.key));
    const vertical = ok.filter(r => !['google', 'bing', 'baidu', 'duckduckgo', 'yahoo', 'yandex', 'sogou', 'so360'].includes(r.key));
    
    if (general.length > 0) {
      console.log('\n🌐 General Search Engines:');
      general.forEach(r => {
        console.log(`  ${r.status} ${r.name.padEnd(20)} - ${r.responseTime} (${r.statusCode})`);
        console.log(`     ${r.description}`);
      });
    }
    
    if (vertical.length > 0) {
      console.log('\n🎯 Vertical Search Engines:');
      vertical.forEach(r => {
        console.log(`  ${r.status} ${r.name.padEnd(20)} - ${r.responseTime} (${r.statusCode})`);
        console.log(`     ${r.description}`);
      });
    }
  }
  
  // Print failed results
  if (failed.length > 0) {
    console.log(`\n❌ UNAVAILABLE (${failed.length}/${engines.length}):\n`);
    console.log('─'.repeat(60));
    failed.forEach(r => {
      console.log(`  ${r.status} ${r.name.padEnd(20)} - ${r.responseTime}`);
      console.log(`     Error: ${r.error || 'Unknown'}`);
      console.log(`     URL: ${r.url}`);
    });
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📈 SUMMARY:\n');
  console.log(`  Total Engines:    ${engines.length}`);
  console.log(`  ✅ Available:     ${ok.length} (${Math.round(ok.length / engines.length * 100)}%)`);
  console.log(`  ❌ Unavailable:   ${failed.length} (${Math.round(failed.length / engines.length * 100)}%)`);
  console.log('═'.repeat(60) + '\n');
  
  // Return results for further processing
  return { ok, failed, total: engines.length };
}

// Run tests
testAllEngines()
  .then((results) => {
    // Exit with error code if any engines failed
    if (results.failed.length > 0) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
