
import { z } from 'zod';

export const faqFormSchema = z.object({
  serperApiKey: z.string().min(1, "Serper API Key is required."),
  openRouterApiKey: z.string().min(1, "OpenRouter API Key is required."),
  url: z.string().url("Please enter a valid URL.").min(1, "URL is required."),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;
