'use server';

/**
 * @fileOverview A flow to format FAQ schema to plain text.
 *
 * - formatFaqToText - A function that formats FAQ schema to plain text.
 * - FormatFaqToTextInput - The input type for the formatFaqToText function.
 * - FormatFaqToTextOutput - The return type for the formatFaqToText function.
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

const FormatFaqToTextInputSchema = z.object({
  jsonLdSchema: z.string().describe('The JSON-LD FAQ schema to format.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key provided by the user.'),
});

export type FormatFaqToTextInput = z.infer<typeof FormatFaqToTextInputSchema>;

const FormatFaqToTextOutputSchema = z.object({
  plainTextFaq: z.string().describe('The formatted plain text FAQ.'),
});

export type FormatFaqToTextOutput = z.infer<typeof FormatFaqToTextOutputSchema>;

export async function formatFaqToText(input: z.infer<typeof FormatFaqToTextInputSchema>): Promise<z.infer<typeof FormatFaqToTextOutputSchema>> {
  try {
    const args = input as FormatFaqToTextInput;

    const apiKey = args.openRouterApiKey;

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    // 🔧 修復：將 system instructions 合併到 user message 中
    const promptWithInstructions = `你是一位內容格式化專家，專門將 JSON-LD FAQ Schema 轉換為易讀的純文字格式。

任務：將提供的 JSON-LD FAQ Schema 轉換為清晰、易讀的問答格式。

格式要求：
1. 每個問題以 "Q: " 開頭
2. 每個答案以 "A: " 開頭
3. 問題和答案之間空一行
4. 每組問答之間空兩行
5. 保持答案的完整性和專業性
6. 確保格式一致且美觀

請只輸出格式化後的純文字內容，不要包含其他說明。

---

JSON-LD FAQ Schema：
${args.jsonLdSchema}

請將以上 JSON-LD FAQ Schema 轉換為純文字格式：`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: promptWithInstructions
        }
      ]
    });

    return {
      plainTextFaq: completion.choices[0].message.content || 'Failed to format FAQ to text.'
    };

  } catch (error: any) {
    console.error("Error formatting FAQ to text:", error);
    return { 
      plainTextFaq: `Error formatting FAQ to text: ${error.message}` 
    };
  }
}