// 最終修復版 src/app/enhanced-actions.ts
// 修復了 peopleAlsoAsk 參數類型問題

"use server";

import { extractTitleKeywords } from '@/ai/flows/extract-keywords';
import { generateFAQSchema } from '@/ai/flows/generate-faq-schema';
import { formatFaqToText } from '@/ai/flows/format-faq-to-text';
import { EnhancedContentAnalyzer } from '@/lib/enhanced-content-analyzer';
import type { FaqFormValues } from '@/lib/schemas';
import type { EnhancedContentAnalysisResult } from '@/lib/enhanced-content-types';
import { addLogEntry, type LogEntry } from '@/lib/logger';

// 修正：統一 SerperPeopleAlsoAskItem 的類型定義
interface SerperPeopleAlsoAskItem {
  question: string;
  snippet?: string;
  title?: string;
  link?: string;
}

interface SerperResponse {
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
}

// 定義回應的資料結構
interface EnhancedActionResponse {
  // 原有的回應（保持兼容性）
  keywords?: string[];
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
  faqSchema?: string;
  plainTextFaq?: string;
  
  // 新增的增強分析結果
  contentAnalysis?: EnhancedContentAnalysisResult;
  enhancedKeywords?: {
    semantic: string[];
    topicClusters: Array<{
      mainTopic: string;
      relatedTerms: string[];
      relevanceScore: number;
    }>;
  };
  seoInsights?: {
    score: number;
    improvements: Array<{
      category: string;
      issue: string;
      suggestion: string;
      impact: number;
    }>;
    recommendations: Array<{
      type: string;
      priority: string;
      title: string;
      description: string;
      actionItems: string[];
    }>;
  };
  
  error?: string;
}

// 主要的增強版處理函數
export async function generateEnhancedFaqAction(values: FaqFormValues): Promise<EnhancedActionResponse> {
  const logData: Partial<LogEntry> = { url: values.url };
  
  try {
    // 步驟1: 抓取網頁內容
    console.log('🌐 正在抓取網頁內容...');
    let htmlContent = '';
    try {
      const response = await fetch(values.url, { 
        headers: { 'User-Agent': 'SchemaFAQBot/1.0' } 
      });
      if (!response.ok) {
        const errorMsg = `無法抓取網頁: ${response.status} ${response.statusText}`;
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg };
      }
      htmlContent = await response.text();
      console.log('✅ 網頁內容抓取成功');
    } catch (e: any) {
      console.error("抓取網頁時發生錯誤:", e);
      logData.error = `抓取網頁錯誤: ${e.message}`;
      await addLogEntry(logData as LogEntry);
      return { error: `抓取網頁錯誤: ${e.message}` };
    }

    // 步驟2: 使用增強版內容分析器
    console.log('🔍 正在進行深度內容分析...');
    let contentAnalysis: EnhancedContentAnalysisResult | undefined;
    let enhancedKeywords: string[] = [];
    
    try {
      const analyzer = new EnhancedContentAnalyzer(htmlContent, values.url);
      contentAnalysis = await analyzer.analyzeContent(values.openRouterApiKey);
      
      // 整合多種關鍵字來源
      enhancedKeywords = [
        ...contentAnalysis.keywords.primaryKeywords,
        ...contentAnalysis.keywords.secondaryKeywords.slice(0, 3),
        ...contentAnalysis.keywords.semanticKeywords.slice(0, 2)
      ].filter((keyword, index, self) => self.indexOf(keyword) === index);
      
      logData.keywords = enhancedKeywords;
      console.log('✅ 內容分析完成，找到', enhancedKeywords.length, '個關鍵字');
      
    } catch (e: any) {
      console.error("增強內容分析失敗，使用基本分析:", e);
      
      // 備用方案：使用原來的方法
      const { title, bodyContent } = extractBasicContent(htmlContent);
      
      if (!title || !bodyContent) {
        const errorMsg = "無法從網頁中提取內容";
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg };
      }

      try {
        const extractedKeywords = await extractTitleKeywords({ 
          title, 
          openRouterApiKey: values.openRouterApiKey 
        });
        enhancedKeywords = extractedKeywords.keywords;
        logData.keywords = enhancedKeywords;
        console.log('✅ 基本關鍵字提取完成');
      } catch (keywordError: any) {
        enhancedKeywords = title.split(/\s+/).filter(k => k.length > 3);
        logData.keywords = enhancedKeywords;
        console.log('⚠️ 使用標題分詞作為關鍵字');
      }
    }

    if (enhancedKeywords.length === 0) {
      const errorMsg = "無法提取任何關鍵字";
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    // 步驟3: 搜尋 People Also Ask 資料
    console.log('🔎 正在搜尋相關問題...');
    let peopleAlsoAskData: SerperPeopleAlsoAskItem[] = [];
    
    try {
      const serperQuery = enhancedKeywords.slice(0, 5).join(' ');
      const serperResponse = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': values.serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: serperQuery }),
      });

      if (!serperResponse.ok) {
        const errorBody = await serperResponse.text();
        console.error(`Serper API 錯誤: ${serperResponse.status}`, errorBody);
        const errorMsg = `Serper API 錯誤: ${serperResponse.status}`;
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg };
      }
      
      const serperResult = await serperResponse.json() as SerperResponse;
      peopleAlsoAskData = serperResult.peopleAlsoAsk || [];
      logData.peopleAlsoAsk = peopleAlsoAskData;
      console.log('✅ 找到', peopleAlsoAskData.length, '個相關問題');
    } catch (e: any) {
      console.error("搜尋相關問題時發生錯誤:", e);
      const errorMsg = `搜尋錯誤: ${e.message}`;
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    // 步驟4: 生成 FAQ Schema
    console.log('📝 正在生成 FAQ Schema...');
    let generatedSchema: { faqSchema: string };
    try {
      const contentForFaq = contentAnalysis?.structure ? 
        `內容分析：字數 ${contentAnalysis.structure.wordCount}，可讀性分數 ${contentAnalysis.structure.readabilityScore}` :
        extractBasicContent(htmlContent).bodyContent;

      // 修正：直接傳遞完整的 peopleAlsoAsk 陣列
      generatedSchema = await generateFAQSchema({
        titleKeywords: enhancedKeywords.join(', '),
        pageContent: contentForFaq,
        peopleAlsoAsk: peopleAlsoAskData,  // 修正：直接傳遞陣列，不轉換為字串
        openRouterApiKey: values.openRouterApiKey,
      });
      logData.faqSchema = generatedSchema.faqSchema;
      console.log('✅ FAQ Schema 生成完成');
    } catch (e: any) {
      console.error("生成 FAQ Schema 時發生錯誤:", e);
      const errorMsg = `FAQ 生成錯誤: ${e.message}`;
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    // 步驟5: 格式化為純文字
    console.log('📋 正在格式化為純文字...');
    let plainTextFaqResult: { plainTextFaq: string } = { 
      plainTextFaq: "無法生成純文字版本" 
    };
    
    if (generatedSchema.faqSchema) {
      try {
        plainTextFaqResult = await formatFaqToText({
          jsonLdSchema: generatedSchema.faqSchema,
          openRouterApiKey: values.openRouterApiKey,
        });
        logData.plainTextFaq = plainTextFaqResult.plainTextFaq;
        console.log('✅ 純文字格式化完成');
      } catch (e: any) {
        console.error("格式化純文字時發生錯誤:", e);
        logData.error = (logData.error ? logData.error + "; " : "") + 
          `格式化錯誤: ${e.message}`;
      }
    }

    // 記錄結果
    await addLogEntry({
      ...logData,
      contentAnalysisScore: contentAnalysis?.seoElements?.seoScore?.overall,
      contentWordCount: contentAnalysis?.structure?.wordCount,
      seoImprovements: contentAnalysis?.seoElements?.seoScore?.improvements?.length
    } as LogEntry);

    console.log('🎉 所有處理完成！');

    // 回傳完整結果
    return {
      // 原有欄位
      keywords: enhancedKeywords,
      peopleAlsoAsk: peopleAlsoAskData,
      faqSchema: generatedSchema.faqSchema,
      plainTextFaq: plainTextFaqResult.plainTextFaq,
      
      // 新增的增強分析結果
      contentAnalysis,
      enhancedKeywords: contentAnalysis ? {
        semantic: contentAnalysis.keywords.semanticKeywords,
        topicClusters: contentAnalysis.keywords.topicClusters
      } : undefined,
      seoInsights: contentAnalysis ? {
        score: contentAnalysis.seoElements.seoScore.overall,
        improvements: contentAnalysis.seoElements.seoScore.improvements,
        recommendations: contentAnalysis.recommendations
      } : undefined
    };

  } catch (error: any) {
    console.error("處理過程中發生未預期的錯誤:", error);
    const errorMsg = error.message || "發生未知錯誤";
    logData.error = errorMsg;
    await addLogEntry(logData as LogEntry);
    return { error: errorMsg };
  }
}

// 基本內容提取函數（備用）
function extractBasicContent(html: string): { title: string, bodyContent: string } {
  let title = "";
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  let bodyContent = html;
  bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  bodyContent = bodyContent.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
  
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  
  if (mainMatch && mainMatch[1]) {
    bodyContent = mainMatch[1];
  } else if (articleMatch && articleMatch[1]) {
    bodyContent = articleMatch[1];
  } else {
    const bodyTagMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyTagMatch && bodyTagMatch[1]) {
      bodyContent = bodyTagMatch[1];
    }
  }
  
  bodyContent = bodyContent.replace(/<[^>]+>/g, ' ');
  bodyContent = bodyContent.replace(/\s\s+/g, ' ').trim();

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

  return { title, bodyContent };
}