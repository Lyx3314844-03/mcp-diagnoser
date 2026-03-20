/**
 * MCP Web Tools Extension
 * Adds web search, crawl, and content extraction tools to MCP Diagnoser
 * 
 * Author: Lan <3314844@gmail.com>
 * Version: 1.3.0
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { execa } from 'execa';

// Web Search Tool
export const WEB_SEARCH_TOOL: Tool = {
  name: 'web_search',
  description: 'Search the web using multiple search engines (Google, Bing, Baidu, DuckDuckGo). Returns search results with snippets and URLs.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
      engine: {
        type: 'string',
        description: 'Search engine (google, bing, baidu, duckduckgo)',
        default: 'google',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 10,
      },
      language: {
        type: 'string',
        description: 'Language code (e.g., en, zh)',
        default: 'en',
      },
      timeRange: {
        type: 'string',
        description: 'Time range (past_hour, past_day, past_week, past_month, past_year)',
        enum: ['past_hour', 'past_day', 'past_week', 'past_month', 'past_year'],
      },
    },
    required: ['query'],
  },
};

// Crawl Website Tool
export const CRAWL_WEBSITE_TOOL: Tool = {
  name: 'crawl_website',
  description: 'Crawl a website and extract content from multiple pages. Supports depth control and same-domain restriction.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Website URL to crawl',
      },
      maxPages: {
        type: 'number',
        description: 'Maximum number of pages to crawl',
        default: 20,
      },
      maxDepth: {
        type: 'number',
        description: 'Maximum crawl depth',
        default: 3,
      },
      sameDomain: {
        type: 'boolean',
        description: 'Only crawl pages within the same domain',
        default: true,
      },
      excludePatterns: {
        type: 'array',
        items: { type: 'string' },
        description: 'URL patterns to exclude (e.g., ["login", "admin"])',
      },
    },
    required: ['url'],
  },
};

// Search Website Content Tool
export const SEARCH_WEBSITE_CONTENT_TOOL: Tool = {
  name: 'search_website_content',
  description: 'Search for content within a crawled website. Returns matching text with context.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Website URL to search',
      },
      query: {
        type: 'string',
        description: 'Search query or regex pattern',
      },
      caseSensitive: {
        type: 'boolean',
        description: 'Case sensitive search',
        default: false,
      },
      wholeWord: {
        type: 'boolean',
        description: 'Match whole words only',
        default: false,
      },
      regex: {
        type: 'boolean',
        description: 'Use regex pattern',
        default: false,
      },
      contextLines: {
        type: 'number',
        description: 'Lines of context to show around matches',
        default: 2,
      },
    },
    required: ['url', 'query'],
  },
};

// Extract Website Info Tool
export const EXTRACT_WEBSITE_INFO_TOOL: Tool = {
  name: 'extract_website_info',
  description: 'Extract structured information from a website including emails, phone numbers, and links.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Website URL to extract from',
      },
      extractEmails: {
        type: 'boolean',
        description: 'Extract email addresses',
        default: true,
      },
      extractPhones: {
        type: 'boolean',
        description: 'Extract phone numbers',
        default: true,
      },
      extractLinks: {
        type: 'boolean',
        description: 'Extract all links',
        default: true,
      },
      extractSocial: {
        type: 'boolean',
        description: 'Extract social media links',
        default: true,
      },
    },
    required: ['url'],
  },
};

// Execute web search
export async function executeWebSearch(
  query: string,
  engine: string = 'google',
  limit: number = 10,
  language: string = 'en',
  timeRange?: string
) {
  try {
    const args = ['web-search', query, '--engine', engine, '--limit', String(limit), '--language', language];
    
    if (timeRange) {
      args.push('--time-range', timeRange);
    }

    const { stdout } = await execa('mcp-diagnoser', args, {
      timeout: 30000,
    });

    return {
      success: true,
      data: stdout,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Execute website crawl
export async function executeWebsiteCrawl(
  url: string,
  maxPages: number = 20,
  maxDepth: number = 3,
  sameDomain: boolean = true,
  excludePatterns: string[] = []
) {
  try {
    const args = ['crawl', url, '--max-pages', String(maxPages), '--max-depth', String(maxDepth)];
    
    if (!sameDomain) {
      args.push('--allow-external');
    }
    
    if (excludePatterns.length > 0) {
      args.push('--exclude', excludePatterns.join(','));
    }

    const { stdout } = await execa('mcp-diagnoser', args, {
      timeout: 60000,
    });

    return {
      success: true,
      data: stdout,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Execute website content search
export async function executeWebsiteSearch(
  url: string,
  query: string,
  caseSensitive: boolean = false,
  wholeWord: boolean = false,
  regex: boolean = false,
  contextLines: number = 2
) {
  try {
    const args = ['search-content', url, query];
    
    if (caseSensitive) {
      args.push('--case-sensitive');
    }
    
    if (wholeWord) {
      args.push('--whole-word');
    }
    
    if (regex) {
      args.push('--regex');
    }
    
    args.push('--context', String(contextLines));

    const { stdout } = await execa('mcp-diagnoser', args, {
      timeout: 60000,
    });

    return {
      success: true,
      data: stdout,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Execute website info extraction
export async function executeWebsiteInfoExtraction(
  url: string,
  extractEmails: boolean = true,
  extractPhones: boolean = true,
  extractLinks: boolean = true,
  extractSocial: boolean = true
) {
  try {
    const args = ['extract-info', url];
    
    if (extractEmails) {
      args.push('--emails');
    }
    
    if (extractPhones) {
      args.push('--phones');
    }
    
    if (extractLinks) {
      args.push('--links');
    }
    
    if (extractSocial) {
      args.push('--all');
    }

    const { stdout } = await execa('mcp-diagnoser', args, {
      timeout: 30000,
    });

    return {
      success: true,
      data: stdout,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
