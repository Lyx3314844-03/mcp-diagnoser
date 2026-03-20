# MCP Diagnoser 多引擎搜索增强方案

## 📊 当前搜索功能分析

### 现有功能

#### 1. 支持的搜索引擎 (`src/tools/browser-search.ts`)

**通用搜索引擎 (8 个)**:
- ✅ Google
- ✅ Bing
- ✅ Baidu (百度)
- ✅ DuckDuckGo
- ✅ Yahoo
- ✅ Yandex (俄罗斯)
- ✅ Sogou (搜狗)
- ✅ 360 Search (360 搜索)

**垂直搜索 (6 个)**:
- ✅ GitHub (代码搜索)
- ✅ Stack Overflow (技术问答)
- ✅ Reddit (社交新闻)
- ✅ YouTube (视频搜索)
- ✅ Bilibili (哔哩哔哩)
- ✅ Google Scholar (学术搜索)
- ✅ arXiv (论文搜索)

#### 2. 搜索功能特性

**基础搜索**:
```typescript
interface SearchOptions {
  engine?: string;           // 指定搜索引擎
  limit?: number;            // 结果数量
  language?: string;         // 语言偏好
  region?: string;           // 地区偏好
  timeRange?: string;        // 时间范围
  fileType?: string;         // 文件类型
  site?: string;             // 站内搜索
  excludeSites?: string[];   // 排除站点
  exactMatch?: boolean;      // 精确匹配
  safeSearch?: boolean;      // 安全搜索
}
```

**高级搜索**:
- ✅ 单引擎搜索 (`search()`)
- ✅ 多引擎并行搜索 (`searchAll()`)
- ✅ Playwright 支持 (JavaScript 渲染页面)
- ✅ URL 构建 (支持高级搜索语法)

---

## 🔍 需要增强的功能

### 1. 真正的多引擎聚合搜索 ⭐⭐⭐⭐⭐

**现状**: 虽然有 `searchAll()` 方法，但功能有限

**增强方案**:

```typescript
interface MultiEngineSearchOptions {
  engines?: string[];        // 要搜索的引擎列表
  deduplicate?: boolean;     // 是否去重
  sortBy?: 'relevance' | 'date' | 'engine'; // 排序方式
  mergeResults?: boolean;    // 是否合并结果
  maxResultsPerEngine?: number; // 每个引擎的最大结果数
  timeout?: number;          // 超时时间 (毫秒)
  failover?: boolean;        // 是否启用故障转移
}

interface AggregatedSearchResults {
  query: string;
  engines: string[];         // 参与搜索的引擎
  totalResults: number;      // 总结果数
  results: SearchResult[];   // 合并后的结果
  engineBreakdown: {         // 各引擎贡献
    [engine: string]: {
      count: number;
      searchTime: number;
      success: boolean;
    };
  };
  duplicates: number;        // 去重数量
  searchTime: number;
}
```

**实现功能**:
- [ ] 同时搜索多个引擎并合并结果
- [ ] 智能去重 (基于 URL 和标题相似度)
- [ ] 结果排序 (按相关性、时间、引擎权重)
- [ ] 故障转移 (某个引擎失败时自动切换)
- [ ] 缓存机制 (避免重复搜索)

---

### 2. 智能引擎选择 ⭐⭐⭐⭐

**现状**: 需要手动指定引擎

**增强方案**:

```typescript
interface SmartSearchOptions {
  queryType?: 'general' | 'code' | 'academic' | 'news' | 'video';
  autoSelectEngines?: boolean;  // 根据查询类型自动选择引擎
  preferRegions?: string[];     // 偏好地区
  languagePriority?: string[];  // 语言优先级
}

// 自动引擎推荐
function recommendEngines(query: string, options: SmartSearchOptions): string[] {
  const recommendations: string[] = [];
  
  // 根据查询类型推荐
  if (options.queryType === 'code') {
    recommendations.push('github', 'stackoverflow');
  } else if (options.queryType === 'academic') {
    recommendations.push('scholar', 'arxiv');
  } else if (options.queryType === 'video') {
    recommendations.push('youtube', 'bilibili');
  } else if (options.queryType === 'news') {
    recommendations.push('google', 'bing', 'baidu');
  }
  
  // 根据语言推荐
  if (options.languagePriority?.includes('zh')) {
    recommendations.push('baidu', 'sogou', 'so360');
  }
  if (options.languagePriority?.includes('ru')) {
    recommendations.push('yandex');
  }
  
  // 默认引擎
  if (recommendations.length === 0) {
    recommendations.push('google', 'bing', 'duckduckgo');
  }
  
  return [...new Set(recommendations)]; // 去重
}
```

---

### 3. 搜索结果缓存 ⭐⭐⭐⭐

**现状**: 每次搜索都重新请求

**增强方案**:

```typescript
interface SearchCache {
  key: string;              // 查询 + 引擎 + 参数的哈希
  results: SearchResults;
  timestamp: number;
  ttl: number;              // 生存时间 (秒)
}

class SearchCacheManager {
  private cache: Map<string, SearchCache>;
  private defaultTTL: number = 3600; // 1 小时
  
  get(key: string): SearchResults | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.results;
  }
  
  set(key: string, results: SearchResults, ttl?: number): void {
    this.cache.set(key, {
      key,
      results,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
    };
  }
}
```

---

### 4. 搜索结果去重 ⭐⭐⭐⭐

**现状**: 无去重机制

**增强方案**:

```typescript
interface DeduplicationOptions {
  method: 'exact' | 'fuzzy' | 'semantic';
  threshold: number;        // 相似度阈值 (0-1)
  fields: ('url' | 'title' | 'snippet')[]; // 比较字段
}

function deduplicateResults(
  results: SearchResult[],
  options: DeduplicationOptions
): SearchResult[] {
  const unique: SearchResult[] = [];
  
  for (const result of results) {
    const isDuplicate = unique.some(existing => {
      if (options.method === 'exact') {
        return options.fields.some(field => 
          result[field] === existing[field]
        );
      } else if (options.method === 'fuzzy') {
        // 使用字符串相似度算法 (如 Levenshtein)
        const titleSimilarity = calculateSimilarity(
          result.title,
          existing.title
        );
        return titleSimilarity >= options.threshold;
      }
      return false;
    });
    
    if (!isDuplicate) {
      unique.push(result);
    }
  }
  
  return unique;
}
```

---

### 5. 搜索结果排序优化 ⭐⭐⭐

**现状**: 简单按引擎顺序排列

**增强方案**:

```typescript
interface RankingOptions {
  method: 'relevance' | 'date' | 'popularity' | 'custom';
  engineWeights?: Record<string, number>; // 引擎权重
  boostRecent?: boolean;  // 提升新内容
  boostPopular?: boolean; // 提升热门内容
}

function rankResults(
  results: SearchResult[],
  options: RankingOptions
): SearchResult[] {
  return results.sort((a, b) => {
    let scoreA = calculateScore(a, options);
    let scoreB = calculateScore(b, options);
    return scoreB - scoreA; // 降序
  });
}

function calculateScore(
  result: SearchResult,
  options: RankingOptions
): number {
  let score = 0;
  
  // 引擎权重
  if (options.engineWeights?.[result.engine || '']) {
    score += options.engineWeights[result.engine || ''] * 100;
  }
  
  // 位置分数 (越靠前分数越高)
  score += (1000 - result.position) / 10;
  
  // 时间分数
  if (options.boostRecent && result.date) {
    const daysOld = (Date.now() - result.date) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 100 - daysOld * 2);
  }
  
  return score;
}
```

---

### 6. 新增搜索引擎 ⭐⭐⭐

**建议添加的引擎**:

```typescript
const ADDITIONAL_ENGINES = {
  // 学术搜索
  semantic_scholar: {
    name: 'Semantic Scholar',
    baseUrl: 'https://www.semanticscholar.org/search',
    searchParam: 'q',
    description: 'AI 驱动的学术搜索引擎',
  },
  pubmed: {
    name: 'PubMed',
    baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
    searchParam: 'term',
    description: '生物医学文献搜索',
  },
  
  // 代码搜索
  gitlab: {
    name: 'GitLab',
    baseUrl: 'https://gitlab.com/search',
    searchParam: 'search',
    description: 'GitLab 代码搜索',
  },
  sourcegraph: {
    name: 'Sourcegraph',
    baseUrl: 'https://sourcegraph.com/search',
    searchParam: 'q',
    description: '跨仓库代码搜索',
  },
  
  // 新闻搜索
  google_news: {
    name: 'Google News',
    baseUrl: 'https://news.google.com/search',
    searchParam: 'q',
    description: 'Google 新闻搜索',
  },
  
  // 中文搜索增强
  wechat: {
    name: '微信搜索',
    baseUrl: 'https://weixin.sogou.com/weixin',
    searchParam: 'query',
    description: '微信公众号文章搜索',
  },
  zhihu: {
    name: '知乎',
    baseUrl: 'https://www.zhihu.com/search',
    searchParam: 'q',
    description: '知乎问答搜索',
  },
};
```

---

### 7. 搜索 API 集成 ⭐⭐⭐⭐⭐

**现状**: 仅支持 HTML 解析

**增强方案**: 集成官方 API

```typescript
// Google Custom Search API
async function searchWithGoogleAPI(
  query: string,
  options: SearchOptions
): Promise<SearchResults> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;
  
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  return {
    query,
    engine: 'Google API',
    total: data.searchInformation?.totalResults || 0,
    results: data.items?.map((item: any, i: number) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      position: i + 1,
      engine: 'Google',
    })) || [],
    searchTime: data.searchInformation?.searchTime || 0,
  };
}

// Bing Search API
async function searchWithBingAPI(
  query: string,
  options: SearchOptions
): Promise<SearchResults> {
  const apiKey = process.env.BING_API_KEY;
  
  const url = new URL('https://api.bing.microsoft.com/v7.0/search');
  url.searchParams.set('q', query);
  
  const response = await fetch(url.toString(), {
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
    },
  });
  const data = await response.json();
  
  return {
    query,
    engine: 'Bing API',
    total: data.webPages?.totalEstimatedMatches || 0,
    results: data.webPages?.value?.map((item: any, i: number) => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
      position: i + 1,
      engine: 'Bing',
    })) || [],
  };
}
```

---

### 8. CLI 命令增强 ⭐⭐⭐

**新增命令**:

```bash
# 多引擎聚合搜索
mcp-diagnoser web-search "query" --engines google,bing,baidu --deduplicate

# 智能搜索 (自动选择引擎)
mcp-diagnoser smart-search "query" --auto-engines

# 搜索统计
mcp-diagnoser search-stats

# 清除搜索缓存
mcp-diagnoser search-cache-clear

# 使用 API 搜索 (更快更准确)
mcp-diagnoser web-search "query" --use-api
```

---

## 📋 实施优先级

### P0 (最高优先级)
1. ✅ **多引擎聚合搜索** - 核心功能
2. ✅ **搜索结果去重** - 提升用户体验
3. ✅ **搜索 API 集成** - 提升稳定性和准确性

### P1 (高优先级)
4. ✅ **智能引擎选择** - 自动化
5. ✅ **搜索结果缓存** - 性能优化
6. ✅ **CLI 命令增强** - 用户体验

### P2 (中优先级)
7. ✅ **新增搜索引擎** - 扩展覆盖
8. ✅ **搜索结果排序优化** - 质量提升

---

## 🎯 预期效果

增强后的多引擎搜索将提供:
- 🚀 **更快的搜索速度** - 并行搜索 + 缓存
- 📊 **更全面的结果** - 多个引擎聚合
- 🎯 **更准确的结果** - 智能排序 + 去重
- 🤖 **更智能的选择** - 自动引擎推荐
- 💾 **更低的成本** - 减少重复请求

---

*文档生成时间：2026-03-20*
