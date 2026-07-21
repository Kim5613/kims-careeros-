/**
 * 实时搜索模块 — Phase 2 联网搜索
 *
 * 默认使用 DuckDuckGo（免费，无需 API Key）
 * 可选配置 TAVILY_API_KEY 使用 Tavily Search API（更稳定，专为 AI Agent 设计）
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalEstimate: number;
  provider: 'duckduckgo' | 'tavily';
}

/**
 * 搜索网页（快速搜索）
 * 单轮搜索，几秒内返回结果
 */
export async function searchWeb(
  query: string,
  limit: number = 5,
): Promise<SearchResponse> {
  // 优先使用 Tavily（如果有 API Key）
  if (process.env.TAVILY_API_KEY) {
    return searchWithTavily(query, limit);
  }
  return searchWithDuckDuckGo(query, limit);
}

/**
 * 抓取单个网页内容
 * 返回纯文本，用于深度研究时的交叉验证
 */
export async function fetchPage(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return `[网页抓取失败: HTTP ${response.status}]`;

    const html = await response.text();
    return extractText(html);
  } catch (error) {
    return `[网页抓取失败: ${(error as Error).message}]`;
  }
}

// ============================================================
// DuckDuckGo 搜索（免费，无需 API Key）
// ============================================================

async function searchWithDuckDuckGo(
  query: string,
  limit: number,
): Promise<SearchResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const formData = new URLSearchParams({ q: query });
    const url = `https://html.duckduckgo.com/html/`;
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      body: formData.toString(),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`DuckDuckGo HTTP ${response.status}`);
    }

    const html = await response.text();
    const results = parseDuckDuckGoHTML(html, limit);

    return {
      query,
      results,
      totalEstimate: results.length,
      provider: 'duckduckgo',
    };
  } catch (error) {
    console.error('[search] DuckDuckGo 搜索失败:', error);
    return { query, results: [], totalEstimate: 0, provider: 'duckduckgo' };
  }
}

/**
 * 解析 DuckDuckGo HTML 搜索结果
 * 使用正则提取，零依赖
 */
function parseDuckDuckGoHTML(html: string, limit: number): SearchResult[] {
  const results: SearchResult[] = [];

  // 每个结果块：<a rel="nofollow" class="result__a" href="...">title</a>
  // 摘要：<a class="result__snippet">snippet</a>
  const resultRegex =
    /<a[^>]*rel="nofollow"[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = resultRegex.exec(html)) !== null && results.length < limit) {
    const url = decodeURIComponent(match[1].replace(/\/\/duckduckgo\.com\/l\/\?uddg=/, ''));
    const title = stripTags(match[2]).trim();
    const snippet = stripTags(match[3]).trim();

    if (title && url && !url.includes('duckduckgo.com')) {
      results.push({ title, url, snippet });
    }
  }

  return results;
}

// ============================================================
// Tavily Search API（可选，更稳定，专为 AI Agent 设计）
// 免费额度：1000 次/月，注册地址 https://tavily.com
// ============================================================

async function searchWithTavily(
  query: string,
  limit: number,
): Promise<SearchResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: limit,
        search_depth: 'basic',
        include_raw_content: false,
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Tavily HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      query,
      results: (data.results || []).slice(0, limit).map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        snippet: r.content || r.snippet || '',
      })),
      totalEstimate: data.results?.length || 0,
      provider: 'tavily',
    };
  } catch (error) {
    console.error('[search] Tavily 搜索失败，回退到 DuckDuckGo:', error);
    return searchWithDuckDuckGo(query, limit);
  }
}

// ============================================================
// HTML → 纯文本工具
// ============================================================

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractText(html: string): string {
  // 去掉 script/style/noscript/iframe
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, ' ');

  // 移除所有标签
  text = text.replace(/<[^>]*>/g, ' ');

  // HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));

  // 合并空白，限制长度
  text = text.replace(/\s+/g, ' ').trim();

  // 限制返回长度，避免 token 爆
  if (text.length > 6000) {
    text = text.slice(0, 6000) + '...[内容已截断]';
  }

  return text;
}
