
'use server';

/**
 * @fileOverview A flow to format JSON-LD FAQ schema into plain text Q&A.
 *
 * - formatFaqToText - A function that formats FAQ schema to plain text.
 * - FormatFaqToTextInput - The input type for the formatFaqToText function.
 * - FormatFaqToTextOutput - The return type for the formatFaqToText function.
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

const FormatFaqToTextInputSchema = z.object({
  jsonLdSchema: z.string().describe('The JSON-LD FAQPage schema string.'),
  openRouterApiKey: z.string().min(1).describe('The OpenRouter API Key.'),
});
export type FormatFaqToTextInput = z.infer<typeof FormatFaqToTextInputSchema>;

const FormatFaqToTextOutputSchema = z.object({
  plainTextFaq: z.string().describe('The FAQ content formatted as plain text Q&A.'),
});
export type FormatFaqToTextOutput = z.infer<typeof FormatFaqToTextOutputSchema>;


export async function formatFaqToText(input: z.infer<typeof FormatFaqToTextInputSchema>): Promise<z.infer<typeof FormatFaqToTextOutputSchema>> {
  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-4-maverick:free',
    messages: [
      {
        role: 'system',
        content: `You are a text formatting assistant. Your task is to convert the given JSON-LD FAQPage schema into a plain text question and answer format. For each question and answer pair found in the 'mainEntity' array of the JSON-LD, format it strictly as:\n問：[Question text from the 'name' field of the Question object]\n答：[Answer text from the 'text' field of the acceptedAnswer object]\n\nEnsure each Q&A pair is separated by exactly one blank line. If the input JSON-LD is invalid or does not contain FAQ data, return an appropriate message like "Could not parse FAQ content for plain text display."`
      },
      {
        role: 'user',
        content: `JSON-LD Input:\n${input.jsonLdSchema}\n\nPlain Text Output:`
      }
    ]
  });

  return {
    plainTextFaq: completion.choices[0].message.content || ''
  };
}
