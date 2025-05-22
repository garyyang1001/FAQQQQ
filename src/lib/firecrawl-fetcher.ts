// src/lib/firecrawl-fetcher.ts
// 使用 Firecrawl API 抓取網頁內容

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description?: string;
      language?: string;
      keywords?: string;
      statusCode: number;
      sourceURL: string;
    };
  };
  error?: string;
}

interface ContentResult {
  title: string;
  bodyContent: string;
  metadata?: {
    description?: string;
    language?: string;
    keywords?: string;
  };
}

export async function fetchContentWithFirecrawl(
  url: string, 
  firecrawlApiKey: string
): Promise<ContentResult> {
  try {
    console.log('🔥 使用 Firecrawl 抓取內容:', url);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true, // 只抓取主要內容
        waitFor: 2000, // 等待動態內容載入
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API 錯誤 (${response.status}): ${errorText}`);
    }

    const result: FirecrawlResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(`Firecrawl 抓取失敗: ${result.error || '未知錯誤'}`);
    }

    const { data } = result;
    
    // 從 Markdown 內容中提取純文字（移除 Markdown 語法）
    const bodyContent = cleanMarkdownContent(data.markdown);
    
    // 確保有標題
    const title = data.metadata.title || extractTitleFromContent(bodyContent) || '未知標題';

    console.log('✅ Firecrawl 抓取成功');
    console.log(`📄 標題: ${title}`);
    console.log(`📝 內容長度: ${bodyContent.length} 字元`);

    return {
      title: title.trim(),
      bodyContent: bodyContent.trim(),
      metadata: {
        description: data.metadata.description,
        language: data.metadata.language,
        keywords: data.metadata.keywords,
      }
    };

  } catch (error: any) {
    console.error('❌ Firecrawl 抓取失敗:', error);
    throw new Error(`Firecrawl 抓取錯誤: ${error.message}`);
  }
}

// 清理 Markdown 內容，轉換為純文字
function cleanMarkdownContent(markdown: string): string {
  if (!markdown) return '';

  let cleaned = markdown;
  
  // 移除 Markdown 語法
  cleaned = cleaned
    // 移除圖片語法 ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除連結語法，保留文字 [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除標題符號 # ## ###
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗體和斜體符號 **bold** *italic*
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // 移除程式碼區塊 ```code```
    .replace(/```[\s\S]*?```/g, '')
    // 移除行內程式碼 `code`
    .replace(/`([^`]+)`/g, '$1')
    // 移除水平線 ---
    .replace(/^-{3,}$/gm, '')
    // 移除引用符號 >
    .replace(/^>\s*/gm, '')
    // 移除列表符號 - * +
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // 移除有序列表符號 1. 2. 3.
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 合併多個空行為單個空行
    .replace(/\n\s*\n/g, '\n\n')
    // 移除行首行尾空白
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    // 移除多餘空白
    .replace(/[ \t]+/g, ' ');

  return cleaned.trim();
}

// 從內容中提取標題（如果 metadata 中沒有標題）
function extractTitleFromContent(content: string): string {
  if (!content) return '';
  
  // 取前面幾行，找出最可能的標題
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // 如果這行看起來像標題（不太長，不是常見的導航文字）
    if (trimmed.length > 5 && trimmed.length < 100 && 
        !trimmed.includes('|') && 
        !trimmed.toLowerCase().includes('menu') &&
        !trimmed.toLowerCase().includes('navigation')) {
      return trimmed;
    }
  }
  
  return '';
}

// 備用抓取方法（如果 Firecrawl 失敗時使用）
export async function fallbackFetchContent(url: string): Promise<ContentResult> {
  console.log('🔄 使用備用方法抓取內容');
  
  try {
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SchemaFAQBot/1.0)' } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // 基本的 HTML 解析
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // 提取 body 內容並移除 HTML 標籤
    let bodyContent = html;
    bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    bodyContent = bodyContent.replace(/<[^>]+>/g, ' ');
    bodyContent = bodyContent.replace(/\s+/g, ' ').trim();

    const MAX_CONTENT_LENGTH = 15000;
    if (bodyContent.length > MAX_CONTENT_LENGTH) {
      bodyContent = bodyContent.substring(0, MAX_CONTENT_LENGTH) + "... (truncated)";
    }

    if (!title && bodyContent) {
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        title = h1Match[1].trim();
      }
    }

    return { 
      title: title || '未知標題', 
      bodyContent: bodyContent || '' 
    };
    
  } catch (error: any) {
    throw new Error(`備用抓取失敗: ${error.message}`);
  }
}