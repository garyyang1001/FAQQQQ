// src/lib/schemas.ts
// 新增 Firecrawl API Key 支援

import { z } from 'zod';

export const faqFormSchema = z.object({
  serperApiKey: z.string().min(1, '請輸入 Serper API Key'),
  openRouterApiKey: z.string().min(1, '請輸入 OpenRouter API Key'),
  firecrawlApiKey: z.string().min(1, '請輸入 Firecrawl API Key'),
  url: z.string().url('請輸入有效的 URL'),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;