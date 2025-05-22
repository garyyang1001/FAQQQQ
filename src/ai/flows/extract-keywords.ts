'use server';

/**
 * @fileOverview Extracts keywords from a given title using the OpenRouter API.
 *
 * - extractTitleKeywords - A function that extracts keywords from a title.
 * - ExtractTitleKeywordsInput - The input type for the extractTitleKeywords function.
 * - ExtractTitleKeywordsOutput - The return type for the extractTitleKeywords function.
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are an expert in SEO and keyword extraction. Your task is to extract the most relevant keywords from the given title. Return ONLY a JSON array of 3 to 5 keywords. No explanations or additional text. Ensure the output is valid JSON.`;

const ExtractTitleKeywordsInputSchema = z.object({
  title: z.string().describe('The title of the webpage.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key provided by the user.'),
});
export type ExtractTitleKeywordsInput = z.infer<typeof ExtractTitleKeywordsInputSchema>;

const ExtractTitleKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of keywords extracted from the title.'),
});
export type ExtractTitleKeywordsOutput = z.infer<typeof ExtractTitleKeywordsOutputSchema>;

export async function extractTitleKeywords(input: z.infer<typeof ExtractTitleKeywordsInputSchema>): Promise<z.infer<typeof ExtractTitleKeywordsOutputSchema>> {
  try {
    const apiKey = input.openRouterApiKey;

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

  const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Title: ${input.title}\n\nReturn ONLY a JSON array of 3 to 5 keywords. For example: ["keyword1","keyword2","keyword3"]`
        }
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[extractTitleKeywords] AI response:', completion.choices[0].message.content);
    }

    const raw = completion.choices[0].message.content || '[]';
    const match = raw.match(/\[[\s\S]*\]/);
    const jsonString = match ? match[0] : '[]';
    const parsed = z.array(z.string()).safeParse(JSON.parse(jsonString));

    return { keywords: parsed.success ? parsed.data : [] };
  } catch (error: any) {
    console.error('[extractTitleKeywords] ', error.message);
    return { keywords: [] };
  }
}
