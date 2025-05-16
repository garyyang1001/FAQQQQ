
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

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

const GenerateFAQSchemaInputSchema = z.object({
  titleKeywords: z.string().describe('Keywords extracted from the title of the URL content.'),
  pageContent: z.string().describe('The content of the page from the URL.'),
  peopleAlsoAsk: z.string().describe('The data from the "People Also Ask" search results.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key.'),
});
export type GenerateFAQSchemaInput = z.infer<typeof GenerateFAQSchemaInputSchema>;

const GenerateFAQSchemaOutputSchema = z.object({
  faqSchema: z.string().describe('The generated FAQ schema structured data in JSON-LD format.'),
});
export type GenerateFAQSchemaOutput = z.infer<typeof GenerateFAQSchemaOutputSchema>;

export async function generateFAQSchema(input: GenerateFAQSchemaInput): Promise<GenerateFAQSchemaOutput> {
  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-4-maverick:free',
    messages: [
      {
        role: 'system',
        content: `You are an AI SEO expert. Your task is to generate FAQ schema structured data in JSON-LD format, based on the provided page content and "People Also Ask" data. Ensure the generated schema is valid JSON-LD and follows the schema.org FAQPage schema guidelines.`
      },
      {
        role: 'user',
        content: `Title Keywords: ${input.titleKeywords}\nPage Content: ${input.pageContent}\nPeople Also Ask: ${input.peopleAlsoAsk}\n\nOutput the complete JSON-LD schema.`
      }
    ]
  });

  return {
    faqSchema: completion.choices[0].message.content || ''
  };
}
