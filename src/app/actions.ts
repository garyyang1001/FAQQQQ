
"use server";

import { extractTitleKeywords } from '@/ai/flows/extract-keywords';
import { generateFAQSchema } from '@/ai/flows/generate-faq-schema';
import { formatFaqToText } from '@/ai/flows/format-faq-to-text'; // Import new flow
import type { FaqFormValues } from '@/lib/schemas';
import { addLogEntry, type LogEntry } from '@/lib/logger';

interface SerperPeopleAlsoAskItem {
  question: string;
  snippet?: string;
  title?: string;
  link?: string;
}

interface SerperResponse {
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
}

interface ActionResponse {
  keywords?: string[];
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
  faqSchema?: string;
  plainTextFaq?: string; // For AI-generated plain text
  error?: string;
}

function extractRelevantContent(html: string): { title: string, bodyContent: string } {
  let title = "";
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  let bodyContent = html;
  bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  bodyContent = bodyContent.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
  
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  
  if (mainMatch && mainMatch[1]) {
    bodyContent = mainMatch[1];
  } else if (articleMatch && articleMatch[1]) {
    bodyContent = articleMatch[1];
  } else {
    const bodyTagMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyTagMatch && bodyTagMatch[1]) {
      bodyContent = bodyTagMatch[1];
    }
  }
  
  bodyContent = bodyContent.replace(/<[^>]+>/g, ' ');
  bodyContent = bodyContent.replace(/\s\s+/g, ' ').trim();

  const MAX_CONTENT_LENGTH = 15000;
  if (bodyContent.length > MAX_CONTENT_LENGTH) {
    bodyContent = bodyContent.substring(0, MAX_CONTENT_LENGTH) + "... (truncated)";
  }

  if (!title && bodyContent) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].trim();
    }
  }

  return { title, bodyContent };
}

export async function generateFaqAction(values: FaqFormValues): Promise<ActionResponse> {
  const logData: Partial<LogEntry> = { url: values.url };
  
  try {
    let htmlContent = '';
    try {
      const response = await fetch(values.url, { headers: { 'User-Agent': 'SchemaFAQBot/1.0' } });
      if (!response.ok) {
        const errorMsg = `Failed to fetch URL: ${response.status} ${response.statusText}`;
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg };
      }
      htmlContent = await response.text();
    } catch (e: any) {
      console.error("Error fetching URL:", e);
      logData.error = `Error fetching URL: ${e.message}`;
      await addLogEntry(logData as LogEntry);
      return { error: `Error fetching URL: ${e.message}` };
    }
    
    const { title, bodyContent } = extractRelevantContent(htmlContent);

    if (!title && !bodyContent) {
        const errorMsg = "Could not extract title or content from the URL.";
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg};
    }
    if (!title) {
        const errorMsg = "Could not extract title from the URL. A title is required for keyword extraction.";
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg};
    }
    if (!bodyContent) {
        const errorMsg = "Could not extract relevant page content from the URL.";
        logData.error = errorMsg;
        await addLogEntry(logData as LogEntry);
        return { error: errorMsg};
    }

    let extractedKeywords: { keywords: string[] } = { keywords: [] };
    try {
      extractedKeywords = await extractTitleKeywords({ title, openRouterApiKey: values.openRouterApiKey });
      logData.keywords = extractedKeywords.keywords;
      if (!extractedKeywords.keywords || extractedKeywords.keywords.length === 0) {
        extractedKeywords.keywords = title.split(/\s+/).filter(k => k.length > 3); 
         if (extractedKeywords.keywords.length === 0) {
            const errorMsg = "Failed to extract keywords and title is too short for fallback.";
            logData.error = errorMsg;
            logData.keywords = [];
            await addLogEntry(logData as LogEntry);
            return { error: errorMsg };
         }
         logData.keywords = extractedKeywords.keywords;
      }
    } catch (e: any) {
      console.error("Error extracting keywords:", e);
      const errorMsg = `Error extracting keywords: ${e.message}. Ensure Genkit is configured and API key is valid.`;
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    let peopleAlsoAskData: SerperPeopleAlsoAskItem[] = [];
    try {
      const serperUrl = `https://google.serper.dev/search`;

      for (const keyword of extractedKeywords.keywords) {
        const serperResponse = await fetch(serperUrl, {
          method: 'POST',
          headers: {
            'X-API-KEY': values.serperApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: keyword }),
        });

        if (!serperResponse.ok) {
          const errorBody = await serperResponse.text();
          console.error(`Serper API error: ${serperResponse.status} ${serperResponse.statusText}`, errorBody);
          const errorMsg = `Serper API error: ${serperResponse.status} - ${errorBody}`;
          logData.error = errorMsg;
          await addLogEntry(logData as LogEntry);
          continue; // Continue to the next keyword
        }

        const serperResult = await serperResponse.json() as SerperResponse;
        if (serperResult.peopleAlsoAsk) {
          peopleAlsoAskData = peopleAlsoAskData.concat(serperResult.peopleAlsoAsk);
        }
      }
      logData.peopleAlsoAsk = peopleAlsoAskData;
    } catch (e: any) {
      console.error("Error fetching People Also Ask data:", e);
      const errorMsg = `Error fetching People Also Ask data: ${e.message}`;
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }
    
    let generatedSchema: { faqSchema: string };
    try {
      generatedSchema = await generateFAQSchema({
  titleKeywords: extractedKeywords.keywords.join(', '),
  pageContent: bodyContent,
  peopleAlsoAsk: peopleAlsoAskData,
  openRouterApiKey: values.openRouterApiKey,
      });
      logData.faqSchema = generatedSchema.faqSchema;
    } catch (e: any) {
      console.error("Error generating FAQ schema:", e);
      const errorMsg = `Error generating FAQ schema: ${e.message}. Ensure API key is valid.`;
      logData.error = errorMsg;
      await addLogEntry(logData as LogEntry);
      return { error: errorMsg };
    }

    let plainTextFaqResult: { plainTextFaq: string } = { plainTextFaq: "Could not generate plain text FAQ." };
    if (generatedSchema.faqSchema) {
      try {
    plainTextFaqResult = await formatFaqToText({
      jsonLdSchema: generatedSchema.faqSchema,
      openRouterApiKey: values.openRouterApiKey,
    });
    logData.plainTextFaq = plainTextFaqResult.plainTextFaq;
  } catch (e: any) {
        console.error("Error formatting FAQ to plain text:", e);
        logData.error = (logData.error ? logData.error + "; " : "") + `Error formatting FAQ to plain text: ${e.message}`;
        // Continue without plain text if formatting fails
      }
    }
    
    await addLogEntry(logData as LogEntry);
    return {
      keywords: extractedKeywords.keywords,
      peopleAlsoAsk: peopleAlsoAskData,
      faqSchema: generatedSchema.faqSchema,
      plainTextFaq: plainTextFaqResult.plainTextFaq,
    };

  } catch (error: any) {
    console.error("Unhandled error in generateFaqAction:", error);
    const errorMsg = error.message || "An unexpected error occurred.";
    logData.error = errorMsg;
    await addLogEntry(logData as LogEntry);
    return { error: errorMsg };
  }
}
