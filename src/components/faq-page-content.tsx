
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqFormSchema, type FaqFormValues } from '@/lib/schemas';
import { generateFaqAction } from '@/app/actions';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from '@/components/copy-button';
import { Loader2, AlertTriangle, KeyRound, Link2, ListTree, FileJson2, Sparkles, TextQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


interface SerperPeopleAlsoAskItem {
  question: string;
  snippet?: string;
  title?: string;
  link?: string;
}

interface ResultData {
  keywords?: string[];
  peopleAlsoAsk?: SerperPeopleAlsoAskItem[];
  faqSchema?: string;
  plainTextFaq?: string;
}

export function FaqPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      serperApiKey: '',
      openRouterApiKey: '',
      url: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      form.setValue('serperApiKey', sessionStorage.getItem('serperApiKey') || '');
      form.setValue('openRouterApiKey', sessionStorage.getItem('openRouterApiKey') || '');
    }
  }, [form]);

  async function onSubmit(values: FaqFormValues) {
    setIsLoading(true);
    setError(null);
    setResultData(null);

    // Save API keys to sessionStorage
    sessionStorage.setItem('serperApiKey', values.serperApiKey);
    sessionStorage.setItem('openRouterApiKey', values.openRouterApiKey);

    const response = await generateFaqAction(values);

    if (response.error) {
      setError(response.error);
    } else {
      let formattedSchema = response.faqSchema;
      if (response.faqSchema) {
        try {
          const parsedSchema = JSON.parse(response.faqSchema);
          formattedSchema = JSON.stringify(parsedSchema, null, 2);
        } catch (e) {
          console.warn("Could not parse FAQ schema for formatting:", e);
        }
      }
      setResultData({
        keywords: response.keywords,
        peopleAlsoAsk: response.peopleAlsoAsk,
        faqSchema: formattedSchema,
        plainTextFaq: response.plainTextFaq,
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 flex flex-row gap-8">
      <div className="w-1/3 sticky top-8 h-fit flex flex-col justify-center">
        <div className="text-left">
          <h1 className="text-4xl font-bold tracking-tight text-primary">FAQ結構化資料產生器</h1>
          <h2 className="text-2xl text-muted-foreground mt-1 mb-4">FAQ Schema Generator</h2>
          <p className="text-lg text-muted-foreground mt-4">
            FAQ 結構化資料的複雜問題，交給AI<br />
            想搞定 AI 時代 SEO的問題，交給好事
          </p>
          
          <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-primary/90">Serper</h2>
              <p className="text-sm text-muted-foreground">
                  負責依照AI抓取出的關鍵字進行搜尋，找出該關鍵字搜尋結果的常見問題。<br />
                  請到 Serper 網站註冊一個免費帳號，即有2500次免費使用額度，
                  <a href="https://serper.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      點我前往
                  </a>。
              </p>

              <h2 className="text-xl font-semibold text-primary/90">免費使用 Gemini AI</h2>
              <p className="text-sm text-muted-foreground">
                  請到<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a> 註冊一個免費api key，填入下方Gemini API Key 欄位。
              </p>
               <p className="text-xs text-muted-foreground/80">
                  (Vercel 使用者注意：若在 Vercel 上部署時遇到 API 金鑰相關錯誤，最可靠的方式是在 Vercel 專案設定中設定 <code>GEMINI_API_KEY</code> 環境變數。)
              </p>
               <p className="text-sm text-muted-foreground mt-2">
                   SEO、整合行銷相關服務，聯絡我們：<a href="mailto:service@ohya.co" className="text-primary hover:underline">service@ohya.co</a>
              </p>
          </div>
        </div>
      </div>
      <div className="w-2/3">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><ListTree className="mr-2 h-6 w-6 text-primary" />Input Details</CardTitle>
          <CardDescription>Provide your API keys and the target URL to generate FAQ schema.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="serperApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-primary/80" />Serper API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="openRouterApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary/80" />OpenRouter API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-or-v1..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Link2 className="mr-2 h-4 w-4 text-primary/80" />Target URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/my-article" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate FAQ Schema"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resultData && (
          <>
            <Card className="mt-8 max-w-2xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center"><FileJson2 className="mr-2 h-6 w-6 text-primary" />Generated Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {resultData.keywords && resultData.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">Extracted Keywords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {resultData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {resultData.peopleAlsoAsk && resultData.peopleAlsoAsk.length > 0 && (
                 <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">People Also Ask:</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {resultData.peopleAlsoAsk.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-sm text-left hover:no-underline">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {item.snippet || "No snippet available."}
                          {item.link && (
                             <a href={item.link} target="_blank" rel="noopener noreferrer" className="block mt-1 text-xs text-primary hover:underline">
                               Source
                             </a>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
              
              {resultData.faqSchema && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-primary/90">Generated FAQ Schema (JSON-LD):</h3>
                    <CopyButton textToCopy={resultData.faqSchema} size="sm" variant="outline">
                      Copy Schema
                    </CopyButton>
                  </div>
                  <Textarea
                    readOnly
                    value={resultData.faqSchema}
                    className="h-96 text-xs bg-muted/30 border-dashed"
                    aria-label="Generated FAQ Schema"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {resultData.plainTextFaq && (
            <Card className="mt-8 max-w-2xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center"><TextQuote className="mr-2 h-6 w-6 text-primary" />Plain Text FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-primary/90">Formatted Q&A:</h3>
                    <CopyButton textToCopy={resultData.plainTextFaq} size="sm" variant="outline">
                      Copy Text
                    </CopyButton>
                  </div>
                  <Textarea
                    readOnly
                    value={resultData.plainTextFaq}
                    className="h-96 text-sm bg-muted/30 border-dashed whitespace-pre-line"
                    aria-label="Plain Text FAQ"
                  />
              </CardContent>
            </Card>
          )}
        </>
      )}
        <footer className="text-center mt-12 py-6 border-t">
          <p className="text-sm text-muted-foreground">
            2025 <a href="https://ohya.co" target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">好事發生數位</a> All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
