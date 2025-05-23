'use server';

/**
 * @fileOverview A flow to extract keywords from a title for FAQ generation.
 *
 * - extractTitleKeywords - A function that extracts keywords from a title.
 * - ExtractTitleKeywordsInput - The input type for the extractTitleKeywords function.
 * - ExtractTitleKeywordsOutput - The return type for the extractTitleKeywords function.
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

const ExtractTitleKeywordsInputSchema = z.object({
  title: z.string().describe('The title from which to extract keywords.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key provided by the user.'),
});

export type ExtractTitleKeywordsInput = z.infer<typeof ExtractTitleKeywordsInputSchema>;

const ExtractTitleKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).describe('The keywords extracted from the title.'),
});

export type ExtractTitleKeywordsOutput = z.infer<typeof ExtractTitleKeywordsOutputSchema>;

export async function extractTitleKeywords(input: z.infer<typeof ExtractTitleKeywordsInputSchema>): Promise<z.infer<typeof ExtractTitleKeywordsOutputSchema>> {
  try {
    const args = input as ExtractTitleKeywordsInput;

    const apiKey = args.openRouterApiKey;

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    // 🔧 修復：將 system instructions 合併到 user message 中
    const promptWithInstructions = `你是一位 SEO 專家，專門從文章標題中提取關鍵字。

任務：從提供的標題中提取 3-5 個最重要的關鍵字，這些關鍵字將用於搜尋相關的 FAQ 問題。

要求：
1. 提取的關鍵字應該是搜尋量較高的詞彙
2. 優先選擇核心主題詞彙，而非修飾詞
3. 每個關鍵字長度建議 2-4 個字
4. 避免過於通用的詞彙（如：方法、技巧等）
5. 以 JSON 格式輸出，格式：{"keywords": ["關鍵字1", "關鍵字2", ...]}

請只輸出 JSON 格式，不要包含其他說明文字。

---

標題：${args.title}

請分析以上標題並提取關鍵字：`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: promptWithInstructions
        }
      ]
    });

    const response = completion.choices[0].message.content || '';
    
    try {
      const parsed = JSON.parse(response);
      return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
      };
    } catch (parseError) {
      console.error('Failed to parse keywords response:', parseError);
      // 如果解析失敗，嘗試從回應中提取關鍵字
      const fallbackKeywords = args.title.split(/\s+/).filter(word => word.length > 1).slice(0, 5);
      return { keywords: fallbackKeywords };
    }

  } catch (error: any) {
    console.error("Error extracting keywords:", error);
    // 返回基於標題的備用關鍵字
    const fallbackKeywords = input.title.split(/\s+/).filter(word => word.length > 1).slice(0, 5);
    return { keywords: fallbackKeywords };
  }
}