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

const GenerateFAQSchemaInputSchema = z.object({
  titleKeywords: z.string().describe('Keywords extracted from the title of the URL content.'),
  pageContent: z.string().describe('The content of the page from the URL.'),
  peopleAlsoAsk: z.array(SerperPeopleAlsoAskItemSchema).describe('The data from the "People Also Ask" search results.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key.'),
});
export type GenerateFAQSchemaInput = z.infer<typeof GenerateFAQSchemaInputSchema>;

const GenerateFAQSchemaOutputSchema = z.object({
  faqSchema: z.string().describe('The generated FAQ schema structured data in JSON-LD format.'),
});
export type GenerateFAQSchemaOutput = z.infer<typeof GenerateFAQSchemaOutputSchema>;

export async function generateFAQSchema(input: z.infer<typeof GenerateFAQSchemaInputSchema>): Promise<z.infer<typeof GenerateFAQSchemaOutputSchema>> {
  try {
    const openai = new OpenAI({
      apiKey: input.openRouterApiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      messages: [
        {
          role: 'system',
          content: `You are an AI SEO 專家.
Your task is to generate 10 FAQ schema structured data in valid JSON-LD format (schema.org/FAQPage) based on the provided page content and People Also Ask data.

Question-rewriting rules (MANDATORY)
	1.	For every original question, first rewrite it into a conversational, voice-search-friendly form in the same language as the page (use natural pronouns like “我/你/我們”, simple vocabulary, keep it under 20 words).
	2.	Preserve the original meaning and intent.
	3.	Use the rewritten version as the acceptedQuestion value in the FAQ schema.

Output rules
• Return one JSON-LD block only – no markdown fences, no extra text.
• The JSON must validate against the FAQPage specification (mainEntity list of Question → acceptedAnswer).
• Each name property = the rewritten question.
• Each text property = a concise, helpful answer drawn from the page content (40-60 words max, no promotional fluff).

Input
(placeholders for page content & PAA list)`
        },
        {
          role: 'user',
          content: `Title Keywords: ${input.titleKeywords}\nPage Content: ${input.pageContent}\nPeople Also Ask: ${JSON.stringify(input.peopleAlsoAsk)}\n\nOutput the complete JSON-LD schema.`
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
