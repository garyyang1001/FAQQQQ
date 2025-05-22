// 左右兩欄佈局版 src/components/enhanced-faq-page-content.tsx
// 包含完整說明文字的響應式智慧 FAQ 生成器

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqFormSchema, type FaqFormValues } from '@/lib/schemas';
import { generateEnhancedFaqAction } from '@/app/enhanced-actions';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from '@/components/copy-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import { 
  Loader2, AlertTriangle, KeyRound, Link2, 
  Sparkles, TextQuote, BarChart3, Target,
  Brain, Users, Lightbulb, TrendingUp, CheckCircle,
  Layers, Search, Zap, Eye, EyeOff, ExternalLink,
  Globe, Mail, MessageCircle
} from 'lucide-react';

// 智慧問題分析結果的類型
interface SmartQuestionAnalysis {
  contentInsights: {
    mainTopics: string[];
    subtopics: string[];
    userGoals: string[];
    painPoints: string[];
    contentType: 'educational' | 'commercial' | 'informational' | 'service';
  };
  layeredQuestions: {
    beginner: Array<{ question: string; reason: string }>;
    intermediate: Array<{ question: string; reason: string }>;
    advanced: Array<{ question: string; reason: string }>;
  };
  optimizedFinalQuestions: Array<{
    question: string;
    category: string;
    source: 'content-analysis' | 'paa' | 'hybrid';
    priority: number;
    searchOptimized: string;
  }>;
}

// 定義結果資料的類型
interface EnhancedResultData {
  keywords?: string[];
  peopleAlsoAsk?: Array<{
    question: string;
    snippet?: string;
  }>;
  faqSchema?: string;
  plainTextFaq?: string;
  seoInsights?: {
    score: number;
    improvements: Array<{
      category: string;
      issue: string;
      suggestion: string;
    }>;
  };
  smartQuestionAnalysis?: SmartQuestionAnalysis;
}

export function EnhancedFaqPageContent() {
  // 狀態管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<EnhancedResultData | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

// 表單設定 - 新增 firecrawlApiKey
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      serperApiKey: '',
      openRouterApiKey: '',
      firecrawlApiKey: '',  // 新增
      url: '',
    },
  });

  // 載入保存的 API Keys - 新增 Firecrawl
  useEffect(() => {
    if (typeof window !== 'undefined') {
      form.setValue('serperApiKey', sessionStorage.getItem('serperApiKey') || '');
      form.setValue('openRouterApiKey', sessionStorage.getItem('openRouterApiKey') || '');
      form.setValue('firecrawlApiKey', sessionStorage.getItem('firecrawlApiKey') || '');  // 新增
    }
  }, [form]);

  // 處理表單提交 - 新增 Firecrawl
  async function onSubmit(values: FaqFormValues) {
    setIsLoading(true);
    setError(null);
    setResultData(null);

    // 保存 API Keys - 新增 Firecrawl
    sessionStorage.setItem('serperApiKey', values.serperApiKey);
    sessionStorage.setItem('openRouterApiKey', values.openRouterApiKey);
    sessionStorage.setItem('firecrawlApiKey', values.firecrawlApiKey);  // 新增

    // ... 其他代碼保持不變
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* 頁面標題保持不變 */}

          {/* 主要內容區域：左右兩欄佈局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            
            {/* 左欄：說明文字 - 更新 Firecrawl 說明 */}
            <div className="space-y-6 lg:space-y-8">
              
              {/* Serper 說明 - 保持不變 */}
              
              {/* Firecrawl 說明 - 新增 */}
              <Card className="shadow-lg border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600 dark:text-orange-400">
                    <Zap className="mr-3 h-6 w-6" />
                    Firecrawl - 強大的網頁抓取
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Firecrawl 專門處理複雜網站抓取，包括動態內容、JS 渲染網站、PDF 和圖片，轉換為乾淨的 Markdown 格式。
                  </p>
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg space-y-3">
                    <p className="text-sm font-medium">🚀 Firecrawl 優勢：</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• 處理動態 JavaScript 渲染內容</li>
                      <li>• 自動處理代理、緩存、速率限制</li>
                      <li>• 輸出高品質 Markdown 和結構化資料</li>
                      <li>• 支援截圖和提取結構化資訊</li>
                    </ul>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        前往 Firecrawl 註冊
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* OpenRouter 說明 - 保持不變 */}
              
              {/* 開發者資訊 - 保持不變 */}
              
              {/* 智慧功能亮點 - 更新 */}
              <Card className="shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Brain className="mr-3 h-6 w-6" />
                    🚀 智慧增強功能
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Firecrawl 強力網頁抓取</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>深度內容分析</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>用戶旅程導向問題生成</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>AI參數自動優化</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右欄：輸入表單 - 新增 Firecrawl API Key */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <Card className="shadow-xl border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary text-xl">
                    <Zap className="mr-3 h-6 w-6" />
                    開始生成 FAQ
                  </CardTitle>
                  <CardDescription className="text-base">
                    填入相關資訊，立即開始智慧化 FAQ 生成
                  </CardDescription>
                </CardHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                      
                      {/* API Keys 區域 - 新增 Firecrawl */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">API 金鑰設定</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKeys(!showApiKeys)}
                            className="text-xs"
                          >
                            {showApiKeys ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                隱藏
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                顯示設定
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {showApiKeys && (
                          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                            
                            {/* Firecrawl API Key - 新增並放在第一位 */}
                            <FormField
                              control={form.control}
                              name="firecrawlApiKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center text-sm">
                                    <Zap className="mr-2 h-4 w-4" />
                                    Firecrawl API Key
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="輸入您的 Firecrawl API Key (fc-...)" 
                                      className="text-sm"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="serperApiKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center text-sm">
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Serper API Key
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="輸入您的 Serper API Key" 
                                      className="text-sm"
                                      {...field} 
                                    />
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
                                  <FormLabel className="flex items-center text-sm">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    OpenRouter API Key
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="輸入您的 OpenRouter API Key" 
                                      className="text-sm"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {/* URL 輸入 - 保持不變 */}
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-base font-medium">
                              <Link2 className="mr-2 h-5 w-5" />
                              目標網址
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/your-article" 
                                className="text-base py-3"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* 提交按鈕 - 保持不變 */}
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-4 text-base font-medium"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            智慧分析中...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-3 h-5 w-5" />
                            開始智慧增強分析
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </form>
                </Form>
              </Card>
            </div>
          </div>

          {/* 其他內容保持不變... */}
        </div>
      </div>
    </div>
  );
}