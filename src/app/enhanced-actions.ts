// 智慧版 src/app/enhanced-actions.ts
// 真正的增強：智慧化 FAQ 問題生成

"use server";

import { extractTitleKeywords } from '@/ai/flows/extract-keywords';
import { generateFAQSchema } from '@/ai/flows/generate-faq-schema';
import { formatFaqToText } from '@/ai/flows/format-faq-to-text';
import { EnhancedContentAnalyzer } from '@/lib/enhanced-content-analyzer';
import { AI_MODEL_CONFIGS } from '@/lib/ai-model-configs';
import type { FaqFormValues } from '@/lib/schemas';
import type { EnhancedContentAnalysisResult } from '@/lib/enhanced-content-types';
import { addLogEntry, type LogEntry } from '@/lib/logger';

// 智慧問題分析結果
interface SmartQuestionAnalysis {
  contentInsights: {
    mainTopics: string[];
    subtopics: string[];
    userGoals: string[];
    painPoints: string[];
    contentType: 'educational' | 'commercial' | 'informational' | 'service';
  };
  layeredQuestions: {
    beginner: Array<{ question: string; reason: string }>;
    intermediate: Array<{ question: string; reason: string }>;
    advanced: Array<{ question: string; reason: string }>;
  };
  optimizedFinalQuestions: Array<{
    question: string;
    category: string;
    source: 'content-analysis' | 'paa' | 'hybrid';
    priority: number;
    searchOptimized: string;
  }>;
}

interface SerperPeopleAlsoAskItem {
  question: string;
  snippet?: string;
  title?: string;
  link?: string;
}

interface SerperResponse {
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
}

interface EnhancedActionResponse {
  keywords?: string[];
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
  faqSchema?: string;
  plainTextFaq?: string;
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
  
  // 新增：智慧問題分析結果
  smartQuestionAnalysis?: SmartQuestionAnalysis;
  
  error?: string;
}

// 智慧問題生成器類別
class IntelligentQuestionGenerator {
  
  async generateSmartQuestions(
    content: string,
    title: string,
    keywords: string[],
    peopleAlsoAsk: SerperPeopleAlsoAskItem[],
    openRouterApiKey: string
  ): Promise<SmartQuestionAnalysis> {
    
    console.log('🧠 開始智慧問題分析...');
    
    // 步驟1: 深度內容分析
    const contentInsights = await this.analyzeContentDepth(content, title, openRouterApiKey);
    console.log('✅ 內容深度分析完成');
    
    // 步驟2: 生成分層問題
    const layeredQuestions = await this.generateLayeredQuestions(
      contentInsights, 
      keywords,
      openRouterApiKey
    );
    console.log('✅ 分層問題生成完成');
    
    // 步驟3: 智慧優化最終問題
    const optimizedFinalQuestions = await this.optimizeWithPAA(
      layeredQuestions,
      peopleAlsoAsk,
      contentInsights,
      openRouterApiKey
    );
    console.log('✅ 問題智慧優化完成');
    
    return {
      contentInsights,
      layeredQuestions,
      optimizedFinalQuestions
    };
  }
  
  // 深度內容分析
  private async analyzeContentDepth(content: string, title: string, apiKey: string) {
    const prompt = `
請深度分析以下網頁內容，提取關鍵資訊：

標題：${title}
內容：${content.substring(0, 3000)}

請分析並回傳 JSON 格式：
{
  "mainTopics": ["主要話題1", "主要話題2"],
  "subtopics": ["子話題1", "子話題2", "子話題3"],
  "userGoals": ["用戶目標1", "用戶目標2"],
  "painPoints": ["用戶痛點1", "用戶痛點2", "用戶痛點3"],
  "contentType": "educational|commercial|informational|service"
}

分析重點：
1. 主要話題：這篇文章主要討論什麼？（2-3個核心主題）
2. 子話題：涵蓋了哪些具體方面？（3-5個子主題）
3. 用戶目標：讀者看這篇文章想達成什麼？（2-3個目標）
4. 用戶痛點：讀者遇到什麼問題或困擾？（3-5個痛點）
5. 內容類型：教育性、商業性、資訊性還是服務性？
`;

    try {
      const result = await this.callAI(prompt, apiKey);
      return result;
    } catch (error) {
      console.error('內容分析失敗:', error);
      return {
        mainTopics: ["基本主題"],
        subtopics: ["相關內容"],
        userGoals: ["了解資訊"],
        painPoints: ["缺乏資訊"],
        contentType: "informational"
      };
    }
  }
  
  // 生成分層問題
  private async generateLayeredQuestions(
    contentInsights: any,
    keywords: string[],
    apiKey: string
  ) {
    const prompt = `
基於以下內容分析，生成三個層次的FAQ問題：

內容洞察：${JSON.stringify(contentInsights, null, 2)}
關鍵字：${keywords.join(', ')}

請為不同層次的用戶生成問題：

1. 入門層（剛接觸該主題的用戶）：
   - 基本定義和概念問題
   - "什麼是..."、"為什麼..."類型
   - 3-4個問題

2. 實用層（有基礎了解，想要具體方法）：
   - "如何..."、"怎麼..."類型
   - 實際操作和方法問題
   - 4-5個問題

3. 進階層（準備採取行動的用戶）：
   - 具體執行、選擇、優化問題
   - 針對服務或產品的具體疑問
   - 3-4個問題

回傳JSON格式：
{
  "beginner": [
    {"question": "問題內容", "reason": "為什麼這個問題重要"}
  ],
  "intermediate": [
    {"question": "問題內容", "reason": "為什麼這個問題重要"}
  ],
  "advanced": [
    {"question": "問題內容", "reason": "為什麼這個問題重要"}
  ]
}

要求：
- 問題要自然口語化，適合語音搜尋
- 問題要直接解決用戶痛點
- 避免過於學術或抽象的問題
- 符合中文用戶習慣
`;

    try {
      const result = await this.callAI(prompt, apiKey);
      return result;
    } catch (error) {
      console.error('分層問題生成失敗:', error);
      return {
        beginner: [
          { question: "這是什麼？", reason: "基本認知需求" }
        ],
        intermediate: [
          { question: "如何使用？", reason: "實用操作需求" }
        ],
        advanced: [
          { question: "哪裡可以獲得服務？", reason: "行動導向需求" }
        ]
      };
    }
  }
  
  // 與PAA結合並優化
  private async optimizeWithPAA(
    layeredQuestions: any,
    peopleAlsoAsk: SerperPeopleAlsoAskItem[],
    contentInsights: any,
    apiKey: string
  ) {
    const prompt = `
整合自主生成的問題與Google PAA數據，生成最終優化的FAQ問題：

自主生成的分層問題：
${JSON.stringify(layeredQuestions, null, 2)}

Google People Also Ask：
${JSON.stringify(peopleAlsoAsk.map(item => item.question), null, 2)}

內容主題：${contentInsights.mainTopics?.join('、')}

請進行智慧整合：
1. 從自主生成的問題中選出最有價值的（優先考慮）
2. 從PAA中補充高搜尋量的相關問題
3. 去除重複和相似問題
4. 確保問題覆蓋完整的用戶旅程
5. 最終選出8-12個最佳問題

回傳JSON格式：
{
  "optimizedQuestions": [
    {
      "question": "優化後的問題內容",
      "category": "入門|實用|進階",
      "source": "content-analysis|paa|hybrid",
      "priority": 1-10,
      "searchOptimized": "語音搜尋優化版本"
    }
  ]
}

優化原則：
- 保留自主生成的高價值問題（這些更貼近內容）
- 適度融入PAA熱門問題（增加搜尋量）
- 問題要能被網頁內容完整回答
- 優先級：解決用戶痛點 > 搜尋熱度
- 語音優化：自然口語化表達
`;

    try {
      const result = await this.callAI(prompt, apiKey);
      return result.optimizedQuestions || [];
    } catch (error) {
      console.error('問題優化失敗:', error);
      // 備用方案：簡單整合
      const fallbackQuestions = [
        ...layeredQuestions.beginner?.slice(0, 3) || [],
        ...layeredQuestions.intermediate?.slice(0, 4) || [],
        ...layeredQuestions.advanced?.slice(0, 3) || []
      ].map((item, index) => ({
        question: item.question,
        category: index < 3 ? '入門' : index < 7 ? '實用' : '進階',
        source: 'content-analysis',
        priority: 10 - index,
        searchOptimized: item.question
      }));
      
      return fallbackQuestions;
    }
  }
  
  private async callAI(prompt: string, apiKey: string) {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });
    
    const completion = await openai.chat.completions.create({
      model: AI_MODEL_CONFIGS.SMART_QUESTIONS.model,
      temperature: AI_MODEL_CONFIGS.SMART_QUESTIONS.temperature,
      top_p: AI_MODEL_CONFIGS.SMART_QUESTIONS.top_p,
      frequency_penalty: AI_MODEL_CONFIGS.SMART_QUESTIONS.frequency_penalty,
      presence_penalty: AI_MODEL_CONFIGS.SMART_QUESTIONS.presence_penalty,
      max_tokens: AI_MODEL_CONFIGS.SMART_QUESTIONS.max_tokens,
      messages: [
        {
          role: 'system',
          content: '你是專業的內容分析師和FAQ專家，擅長理解用戶需求並生成高品質問題。請總是回傳有效的JSON格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    try {
      const content = completion.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : '{}';
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('AI回應解析失敗:', error);
      return {};
    }
  }
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

    // 步驟2: 基礎內容分析
    console.log('🔍 正在進行基礎內容分析...');
    let contentAnalysis: EnhancedContentAnalysisResult | undefined;
    let enhancedKeywords: string[] = [];
    const { title, bodyContent } = extractBasicContent(htmlContent);
    
    if (!title || !bodyContent) {
      const errorMsg = "無法從網頁中提取內容";
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    try {
      const analyzer = new EnhancedContentAnalyzer(htmlContent, values.url);
      contentAnalysis = await analyzer.analyzeContent(values.openRouterApiKey);
      
      enhancedKeywords = [
        ...contentAnalysis.keywords.primaryKeywords,
        ...contentAnalysis.keywords.secondaryKeywords.slice(0, 3),
        ...contentAnalysis.keywords.semanticKeywords.slice(0, 2)
      ].filter((keyword, index, self) => self.indexOf(keyword) === index);
      
      logData.keywords = enhancedKeywords;
      console.log('✅ 基礎內容分析完成，找到', enhancedKeywords.length, '個關鍵字');
      
    } catch (e: any) {
      console.error("增強內容分析失敗，使用基本分析:", e);
      
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
      console.log('✅ 找到', peopleAlsoAskData.length, '個 Google PAA 問題');
    } catch (e: any) {
      console.error("搜尋相關問題時發生錯誤:", e);
      // 不要因為PAA失敗就停止，繼續處理
      console.log('⚠️ PAA 搜尋失敗，將只使用內容分析生成問題');
    }

    // 🧠 步驟4: 智慧問題生成（核心增強功能！）
    console.log('🧠 正在進行智慧問題生成...');
    let smartQuestionAnalysis: SmartQuestionAnalysis | undefined;
    let finalQuestions: Array<{ question: string; answer?: string }> = [];
    
    try {
      const questionGenerator = new IntelligentQuestionGenerator();
      smartQuestionAnalysis = await questionGenerator.generateSmartQuestions(
        bodyContent,
        title,
        enhancedKeywords,
        peopleAlsoAskData,
        values.openRouterApiKey
      );
      
      // 將優化的問題轉換為FAQ格式
      finalQuestions = smartQuestionAnalysis.optimizedFinalQuestions.map(item => ({
        question: item.searchOptimized || item.question,
        // 這裡暫時不生成答案，讓原有的generateFAQSchema處理
      }));
      
      console.log('🎉 智慧問題生成完成，共', finalQuestions.length, '個優化問題');
      
    } catch (e: any) {
      console.error("智慧問題生成失敗，使用備用方案:", e);
      // 備用方案：使用 PAA 問題
      finalQuestions = peopleAlsoAskData.map(item => ({
        question: item.question
      }));
    }

    // 步驟5: 生成增強版 FAQ Schema
    console.log('📝 正在生成增強版 FAQ Schema...');
    let generatedSchema: { faqSchema: string };
    try {
      // 準備增強的內容描述
      const enhancedContent = smartQuestionAnalysis ? 
        `網站主題：${smartQuestionAnalysis.contentInsights.mainTopics?.join('、')}
用戶目標：${smartQuestionAnalysis.contentInsights.userGoals?.join('、')}
主要痛點：${smartQuestionAnalysis.contentInsights.painPoints?.join('、')}
內容類型：${smartQuestionAnalysis.contentInsights.contentType}
原始內容：${bodyContent.substring(0, 1000)}` :
        bodyContent;

      // 使用智慧生成的問題
      const questionsForSchema = finalQuestions.length > 0 ? 
        finalQuestions.map(item => ({ question: item.question })) :
        peopleAlsoAskData;

      generatedSchema = await generateFAQSchema({
        titleKeywords: enhancedKeywords.join(', '),
        pageContent: enhancedContent,
        peopleAlsoAsk: questionsForSchema,
        openRouterApiKey: values.openRouterApiKey,
      });
      logData.faqSchema = generatedSchema.faqSchema;
      console.log('✅ 增強版 FAQ Schema 生成完成');
    } catch (e: any) {
      console.error("生成 FAQ Schema 時發生錯誤:", e);
      const errorMsg = `FAQ 生成錯誤: ${e.message}`;
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    // 步驟6: 格式化為純文字
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

    // 記錄增強結果
    await addLogEntry({
      ...logData,
      contentAnalysisScore: contentAnalysis?.seoElements?.seoScore?.overall,
      contentWordCount: contentAnalysis?.structure?.wordCount,
      seoImprovements: contentAnalysis?.seoElements?.seoScore?.improvements?.length,
      // 新增智慧分析記錄
      smartQuestionsGenerated: finalQuestions.length,
      questionSources: smartQuestionAnalysis?.optimizedFinalQuestions?.map(q => q.source).join(',')
    } as LogEntry);

    console.log('🎉 所有增強處理完成！');

    // 回傳完整增強結果
    return {
      // 原有欄位
      keywords: enhancedKeywords,
      peopleAlsoAsk: peopleAlsoAskData,
      faqSchema: generatedSchema.faqSchema,
      plainTextFaq: plainTextFaqResult.plainTextFaq,
      
      // 增強分析結果
      contentAnalysis,
      enhancedKeywords: contentAnalysis ? {
        semantic: contentAnalysis.keywords.semanticKeywords,
        topicClusters: contentAnalysis.keywords.topicClusters
      } : undefined,
      seoInsights: contentAnalysis ? {
        score: contentAnalysis.seoElements.seoScore.overall,
        improvements: contentAnalysis.seoElements.seoScore.improvements,
        recommendations: contentAnalysis.recommendations
      } : undefined,
      
      // 🚀 新增：智慧問題分析結果
      smartQuestionAnalysis
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