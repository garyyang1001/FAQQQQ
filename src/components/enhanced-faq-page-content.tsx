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
// 在 enhanced-faq-page-content.tsx 中，替換現有的 onSubmit 函數
// 處理表單提交
async function onSubmit(values: FaqFormValues) {
  const sessionId = `session-${Date.now()}`;
  setIsLoading(true);
  setError(null);
  setResultData(null);

  console.log('🚀 前端開始 FAQ 生成流程');
  console.log('📋 表單數據:', {
    url: values.url,
    hasSerperKey: !!values.serperApiKey,
    hasOpenRouterKey: !!values.openRouterApiKey,
    hasFirecrawlKey: !!values.firecrawlApiKey,
    sessionId
  });

  // 保存 API Keys
  sessionStorage.setItem('serperApiKey', values.serperApiKey);
  sessionStorage.setItem('openRouterApiKey', values.openRouterApiKey);
  sessionStorage.setItem('firecrawlApiKey', values.firecrawlApiKey);

  try {
    console.log('📤 呼叫後端 generateEnhancedFaqAction...');
    
    // 調用後端 action
    const result = await generateEnhancedFaqAction(values);
    
    console.log('📥 後端原始回應:', result);

    // 檢查是否有錯誤
    if (result.error) {
      console.error('❌ 後端回應包含錯誤:', result.error);
      throw new Error(result.error);
    }

    // 檢查結果數據
    if (!result.faqSchema && !result.plainTextFaq) {
      console.warn('⚠️ 後端回應沒有包含FAQ數據');
      throw new Error('沒有生成FAQ內容，請檢查日誌');
    }

    console.log('✅ 前端成功接收到結果');
    console.log('📊 結果摘要:', {
      有faqSchema: !!result.faqSchema,
      有plainTextFaq: !!result.plainTextFaq,
      關鍵字數量: result.keywords?.length || 0,
      peopleAlsoAsk數量: result.peopleAlsoAsk?.length || 0,
      有contentAnalysis: !!result.contentAnalysis,
      有seoInsights: !!result.seoInsights,
      有smartQuestionAnalysis: !!result.smartQuestionAnalysis
    });

    // 更新前端狀態
    setResultData(result);

    console.log('🎉 前端狀態更新完成，應該顯示結果了');

  } catch (error: any) {
    console.error('💥 前端處理過程中發生錯誤:', error);
    
    let errorMessage = '處理過程中發生錯誤';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // 根據錯誤類型提供更具體的訊息
    if (errorMessage.includes('API Key')) {
      errorMessage = '🔑 API Key 錯誤: ' + errorMessage;
    } else if (errorMessage.includes('Firecrawl')) {
      errorMessage = '🔥 Firecrawl 服務錯誤: ' + errorMessage;
    } else if (errorMessage.includes('網路') || errorMessage.includes('fetch')) {
      errorMessage = '🌐 網路連線錯誤: ' + errorMessage;
    } else if (errorMessage.includes('timeout')) {
      errorMessage = '⏱️ 請求超時: ' + errorMessage;
    }

    setError(errorMessage);
    
    // 額外的除錯資訊
    console.group('🔍 除錯資訊');
    console.log('錯誤類型:', typeof error);
    console.log('錯誤訊息:', error.message);
    console.log('完整錯誤:', error);
    console.log('當前表單值:', values);
    console.groupEnd();

  } finally {
    setIsLoading(false);
    console.log('🏁 前端 FAQ 生成流程結束');
  }
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
          {/* 結果顯示區域 */}
          {resultData && (
            <div className="mt-8">
              <Card className="shadow-xl border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="mr-3 h-6 w-6" />
                    🎉 FAQ 生成完成
                  </CardTitle>
                  <CardDescription>
                    以下是為您生成的智慧化 FAQ 內容
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="schema" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="schema">JSON-LD Schema</TabsTrigger>
                      <TabsTrigger value="text">純文字版本</TabsTrigger>
                      {resultData.keywords && (
                        <TabsTrigger value="keywords">關鍵字</TabsTrigger>
                      )}
                      {resultData.smartQuestionAnalysis && (
                        <TabsTrigger value="analysis">智慧分析</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="schema" className="space-y-4">
                      {resultData.faqSchema && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold flex items-center">
                              <TextQuote className="mr-2 h-5 w-5" />
                              JSON-LD FAQ Schema
                            </h3>
                            <CopyButton textToCopy={resultData.faqSchema}>
                            複製 Schema
                            </CopyButton>
                          </div>
                          <Textarea
                            value={resultData.faqSchema}
                            readOnly
                            className="min-h-[500px] font-mono text-sm"
                            placeholder="JSON-LD Schema 將顯示在這裡..."
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="text" className="space-y-4">
                      {resultData.plainTextFaq && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold flex items-center">
                              <MessageCircle className="mr-2 h-5 w-5" />
                              純文字 FAQ
                            </h3>
                            <CopyButton textToCopy={resultData.plainTextFaq}>
                                複製文字
                            </CopyButton>
                          </div>
                          <Textarea
                            value={resultData.plainTextFaq}
                            readOnly
                            className="min-h-[500px] leading-relaxed"
                            placeholder="純文字 FAQ 將顯示在這裡..."
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    {resultData.keywords && (
                      <TabsContent value="keywords" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Search className="mr-2 h-5 w-5" />
                            提取的關鍵字 ({resultData.keywords.length} 個)
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {resultData.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    )}
                    
                    {resultData.smartQuestionAnalysis && (
                      <TabsContent value="analysis" className="space-y-6">
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Brain className="mr-2 h-5 w-5" />
                            智慧問題分析結果
                          </h3>
                          
                          {/* 內容洞察 */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">內容洞察</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <strong>主要話題：</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {resultData.smartQuestionAnalysis.contentInsights.mainTopics?.map((topic, index) => (
                                    <Badge key={index} variant="outline">{topic}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <strong>內容類型：</strong>
                                <Badge variant="secondary">{resultData.smartQuestionAnalysis.contentInsights.contentType}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* 優化問題 */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">生成的優化問題</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {resultData.smartQuestionAnalysis.optimizedFinalQuestions?.map((item, index) => (
                                  <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                      <Badge variant="secondary" className="text-xs">{item.source}</Badge>
                                      <span className="text-xs text-muted-foreground">優先級: {item.priority}</span>
                                    </div>
                                    <p className="text-sm font-medium">{item.question}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 錯誤顯示區域 */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>發生錯誤</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}