'use server';

/**
 * @fileOverview A flow to generate FAQ schema structured data for AI SEO.
 *
 * - generateFAQSchema - A function that generates FAQ schema data.
 * - GenerateFAQSchemaInput - The input type for the generateFAQSchema function.
 * - GenerateFAQSchemaOutput - The return type for the generateFAQSchema function.
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

const SerperPeopleAlsoAskItemSchema = z.object({
  question: z.string(),
  snippet: z.string().optional(),
  title: z.string().optional(),
  link: z.string().optional(),
});

// Question patterns lookup table for different article categories.
const QUESTION_PATTERNS: Record<string, string[]> = {
  '生活情感類': ['怎麼判斷…？', '…正常嗎？', '…該怎麼辦？'],
  '產品比較類': ['哪個比較好？', '…差在哪？', '…CP值高嗎？'],
  '知識科普類': ['什麼是…？', '為什麼…會發生？', '…有什麼影響？'],
  '教學指南類': ['如何…？', '怎麼…？', '步驟是什麼？']
};
const DEFAULT_ARTICLE_TYPE = '生活情感類';

const GenerateFAQSchemaInputSchema = z.object({
  titleKeywords: z.string().describe('Keywords extracted from the title of the URL content.'),
  pageContent: z.string().describe('The content of the page from the URL.'),
  peopleAlsoAsk: z.array(SerperPeopleAlsoAskItemSchema).describe('The data from the "People Also Ask" search results.'),
  articleType: z.string().optional().describe('The high‑level category of the article, used to pick question patterns.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key provided by the user.'),
});

export type GenerateFAQSchemaInput = z.infer<typeof GenerateFAQSchemaInputSchema>;

const GenerateFAQSchemaOutputSchema = z.object({
  faqSchema: z.string().describe('The generated FAQ schema structured data in JSON-LD format.'),
});
export type GenerateFAQSchemaOutput = z.infer<typeof GenerateFAQSchemaOutputSchema>;

export async function generateFAQSchema(input: z.infer<typeof GenerateFAQSchemaInputSchema>): Promise<z.infer<typeof GenerateFAQSchemaOutputSchema>> {
  try {
    const args = input as GenerateFAQSchemaInput;

    const apiKey = args.openRouterApiKey;

    const articleType = args.articleType ?? DEFAULT_ARTICLE_TYPE;
    const patterns = QUESTION_PATTERNS[articleType] ?? [];

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    // Trim page content to keep the prompt lightweight (max 1000 characters).
    const trimmedContent =
      args.pageContent.length > 1000
        ? args.pageContent.slice(0, 1000) + '…'
        : args.pageContent;

    // 🔧 修復：將 system instructions 合併到 user message 中
    const systemInstructions = `你是一位專精於 SEO 與語音搜尋優化的 AI 助手。
文章類型：${articleType}
建議問句語氣（參考，可變形）：${patterns.join(' / ')}

請依序執行：
1. 解析提供的標題關鍵字、頁面內容與 People Also Ask 資料。
2. 產出 **6** 個 FAQ，問題需使用自然對話語言，長度 12‑15 字，並盡量參考上方語氣。
3. 每個答案第一句直接點題，總長度 75‑100 字；若屬情感／健康主題，結尾加入同理或實務建議。
4. 先輸出符合 schema.org FAQPage 標準的 JSON‑LD；緊接一行 \`---\` 分隔，再輸出純文字 Q/A（同順序）。
**只允許上述兩段輸出，勿再加入任何說明或前後綴。**

---

Title Keywords: ${args.titleKeywords}
Article Type: ${articleType}
Page Content (truncated): ${trimmedContent}
People Also Ask: ${JSON.stringify(args.peopleAlsoAsk)}

請根據以上資訊，輸出完整的 JSON-LD schema，然後加上 '---' 分隔線，再輸出純文字 FAQ。`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: systemInstructions
        }
      ]
    });

    return {
      faqSchema: completion.choices[0].message.content || ''
    };
  } catch (error: any) {
    console.error("Error generating FAQ schema:", error);
    return { faqSchema: `Error generating FAQ schema: ${error.message}` };
  }
}