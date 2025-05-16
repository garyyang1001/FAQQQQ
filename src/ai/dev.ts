import { config } from 'dotenv';
config();

import '@/ai/flows/extract-keywords.ts';
import '@/ai/flows/generate-faq-schema.ts';
import '@/ai/flows/format-faq-to-text.ts';
