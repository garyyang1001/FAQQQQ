
'use server';

/**
 * @fileOverview Extracts keywords from a given title using the default Genkit model.
 *
 * - extractTitleKeywords - A function that extracts keywords from a title.
 * - ExtractTitleKeywordsInput - The input type for the extractTitleKeywords function.
 * - ExtractTitleKeywordsOutput - The return type for the extractTitleKeywords function.
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

const ExtractTitleKeywordsInputSchema = z.object({
  title: z.string().describe('The title of the webpage.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key.'),
});
export type ExtractTitleKeywordsInput = z.infer<typeof ExtractTitleKeywordsInputSchema>;

const ExtractTitleKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of keywords extracted from the title.'),
});
export type ExtractTitleKeywordsOutput = z.infer<typeof ExtractTitleKeywordsOutputSchema>;

export async function extractTitleKeywords(input: z.infer<typeof ExtractTitleKeywordsInputSchema>): Promise<z.infer<typeof ExtractTitleKeywordsOutputSchema>> {
  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-4-maverick:free',
    messages: [
      {
        role: 'system',
        content: `You are an expert in SEO and keyword extraction. Your task is to extract the most relevant keywords from the given title. Return the keywords as a JSON array of strings.`
      },
      {
        role: 'user',
        content: `Title: ${input.title}\n\nOutput the keywords as a JSON array of strings.`
      }
    ]
  });

  return {
    keywords: JSON.parse(completion.choices[0].message.content || '[]')
  };
}
