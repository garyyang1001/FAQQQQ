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

  // 表單設定
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      serperApiKey: '',
      openRouterApiKey: '',
      url: '',
    },
  });

  // 載入保存的 API Keys
  useEffect(() => {
    if (typeof window !== 'undefined') {
      form.setValue('serperApiKey', sessionStorage.getItem('serperApiKey') || '');
      form.setValue('openRouterApiKey', sessionStorage.getItem('openRouterApiKey') || '');
    }
  }, [form]);

  // 處理表單提交
  async function onSubmit(values: FaqFormValues) {
    setIsLoading(true);
    setError(null);
    setResultData(null);

    // 保存 API Keys
    sessionStorage.setItem('serperApiKey', values.serperApiKey);
    sessionStorage.setItem('openRouterApiKey', values.openRouterApiKey);

    console.log('🚀 開始智慧增強分析...');
    const response = await generateEnhancedFaqAction(values);

    if (response.error) {
      setError(response.error);
      console.error('❌ 處理失敗:', response.error);
    } else {
      // 格式化 JSON 結果
      let formattedSchema = response.faqSchema;
      if (response.faqSchema) {
        try {
          const parsedSchema = JSON.parse(response.faqSchema);
          formattedSchema = JSON.stringify(parsedSchema, null, 2);
        } catch (e) {
          console.warn("無法格式化 FAQ schema:", e);
        }
      }
      
      setResultData({
        keywords: response.keywords,
        peopleAlsoAsk: response.peopleAlsoAsk,
        faqSchema: formattedSchema,
        plainTextFaq: response.plainTextFaq,
        seoInsights: response.seoInsights,
        smartQuestionAnalysis: response.smartQuestionAnalysis,
      });
      console.log('✅ 智慧增強分析完成！');
    }
    setIsLoading(false);
  }

  // SEO 分數的顏色
  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // 問題來源的顏色
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'content-analysis': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case 'paa': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'hybrid': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // 問題類別的圖標
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '入門': return <Users className="h-4 w-4" />;
      case '實用': return <Lightbulb className="h-4 w-4" />;
      case '進階': return <TrendingUp className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* 容器：響應式 padding 和最大寬度 */}
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* 頁面標題 */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-primary" />
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-1">
                  FAQ結構化資料產生器
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground">
                  FAQ Schema Generator
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-4xl mx-auto">
              FAQ 結構化資料的複雜問題，交給AI 想搞定 AI 時代 SEO的問題，交給好事
            </p>
          </div>

          {/* 主要內容區域：左右兩欄佈局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            
            {/* 左欄：說明文字 */}
            <div className="space-y-6 lg:space-y-8">
              
              {/* Serper 說明 */}
              <Card className="shadow-lg border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
                    <Search className="mr-3 h-6 w-6" />
                    Serper
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    負責依照AI抓取出的關鍵字進行搜尋，找出該關鍵字搜尋結果的常見問題。
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">💡 免費額度：2,500次使用</p>
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <a href="https://serper.dev" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        前往 Serper 註冊
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* OpenRouter 說明 */}
              <Card className="shadow-lg border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600 dark:text-green-400">
                    <Sparkles className="mr-3 h-6 w-6" />
                    免費用OpenRouter 處理FAQ結構化資料
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    請到 <strong>OpenRouter</strong> 官網註冊一個免費帳號，取得你的api key 之後，直接填入右側欄位就好。
                  </p>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-3">
                    <p className="text-sm font-medium">🎯 本專案特色：</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• 採用 Google: Gemma 3 27B (free) 語言模型</li>
                      <li>• 完全免費，不會有費用產生</li>
                      <li>• 智慧參數優化，提升生成品質</li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          前往 OpenRouter 註冊
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="https://openrouter.ai/google/gemma-3-27b-it:free" target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-4 w-4" />
                          查看模型詳情
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 開發者資訊 */}
              <Card className="shadow-lg border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-600 dark:text-purple-400">
                    <Users className="mr-3 h-6 w-6" />
                    這小東東是誰開發的？
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary mb-2">好事發生數位</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI SEO、n8n AI 自動化教學、整合行銷相關服務，就降。
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <Button variant="ghost" size="sm" asChild>
                        <a href="https://ohya.co" target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 h-4 w-4" />
                          好事官網
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="https://threads.net/@ohya.studio" target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Threads
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="mailto:service@ohya.co">
                          <Mail className="mr-2 h-4 w-4" />
                          聯絡我們
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 智慧功能亮點 */}
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
                      <span>深度內容分析</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>用戶旅程導向問題生成</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>智慧SEO優化</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>AI參數自動優化</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右欄：輸入表單 */}
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
                      
                      {/* API Keys 區域 */}
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

                      {/* URL 輸入 */}
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
                      
                      {/* 提交按鈕 */}
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

          {/* 錯誤顯示 */}
          {error && (
            <Alert variant="destructive" className="mb-8 shadow-lg">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>錯誤</AlertTitle>
              <AlertDescription className="text-sm sm:text-base break-words">{error}</AlertDescription>
            </Alert>
          )}

          {/* 結果顯示區域 */}
          {resultData && (
            <div className="space-y-8">
              
              {/* SEO 分數卡片 */}
              {resultData.seoInsights && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Target className="mr-3 h-6 w-6 text-primary" />
                      SEO 分析結果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className={`text-5xl font-bold ${getSeoScoreColor(resultData.seoInsights.score)}`}>
                        {resultData.seoInsights.score}/100
                      </div>
                      <p className="text-muted-foreground text-lg">整體 SEO 分數</p>
                      <Progress value={resultData.seoInsights.score} className="mt-3 h-3" />
                    </div>
                    
                    {resultData.seoInsights.improvements.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4 text-lg">改進建議:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {resultData.seoInsights.improvements.slice(0, 6).map((improvement, index) => (
                            <Alert key={index} className="text-sm">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="text-sm">{improvement.issue}</AlertTitle>
                              <AlertDescription className="text-sm">{improvement.suggestion}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 智慧問題分析結果 */}
              {resultData.smartQuestionAnalysis && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Brain className="mr-3 h-6 w-6 text-primary" />
                      智慧問題分析
                    </CardTitle>
                    <CardDescription className="text-base">
                      基於內容深度分析和用戶需求洞察的智慧問題生成
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="insights" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
                        <TabsTrigger value="insights" className="text-sm px-4 py-2">
                          內容洞察
                        </TabsTrigger>
                        <TabsTrigger value="layered" className="text-sm px-4 py-2">
                          分層問題
                        </TabsTrigger>
                        <TabsTrigger value="optimized" className="text-sm px-4 py-2">
                          優化問題
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="text-sm px-4 py-2">
                          分析比較
                        </TabsTrigger>
                      </TabsList>

                      {/* 這裡包含所有 Tab 內容，與之前相同但調整了間距 */}
                      <TabsContent value="insights" className="mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <Layers className="mr-2 h-5 w-5" />
                                主要話題
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {resultData.smartQuestionAnalysis.contentInsights.mainTopics?.map((topic, index) => (
                                  <Badge key={index} variant="default" className="text-xs">{topic}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                用戶目標
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {resultData.smartQuestionAnalysis.contentInsights.userGoals?.map((goal, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">{goal}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                用戶痛點
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {resultData.smartQuestionAnalysis.contentInsights.painPoints?.map((point, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">{point}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <Zap className="mr-2 h-5 w-5" />
                                內容類型
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Badge variant="outline" className="text-base">
                                {resultData.smartQuestionAnalysis.contentInsights.contentType}
                              </Badge>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* 其他 Tab 內容保持不變... */}
                      <TabsContent value="layered" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* 入門層問題 */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <Users className="mr-2 h-5 w-5 text-blue-600" />
                                入門層問題
                              </CardTitle>
                              <CardDescription className="text-sm">剛接觸該主題的用戶</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resultData.smartQuestionAnalysis.layeredQuestions.beginner?.map((item, index) => (
                                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                  <p className="font-medium text-sm">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* 實用層問題 */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                                實用層問題
                              </CardTitle>
                              <CardDescription className="text-sm">有基礎了解，想要具體方法</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resultData.smartQuestionAnalysis.layeredQuestions.intermediate?.map((item, index) => (
                                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                  <p className="font-medium text-sm">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* 進階層問題 */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                                進階層問題
                              </CardTitle>
                              <CardDescription className="text-sm">準備採取行動的用戶</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resultData.smartQuestionAnalysis.layeredQuestions.advanced?.map((item, index) => (
                                <div key={index} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                  <p className="font-medium text-sm">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* 優化問題和分析比較的內容保持與之前相同... */}
                      <TabsContent value="optimized" className="mt-6">
                        <div className="space-y-4">
                          {resultData.smartQuestionAnalysis.optimizedFinalQuestions?.map((item, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {getCategoryIcon(item.category)}
                                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                      <Badge className={`${getSourceColor(item.source)} text-xs`}>
                                        {item.source === 'content-analysis' ? '內容分析' : 
                                         item.source === 'paa' ? 'Google PAA' : '混合優化'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        優先級: {item.priority}/10
                                      </span>
                                    </div>
                                    <p className="font-medium text-base">{item.question}</p>
                                    {item.searchOptimized !== item.question && (
                                      <p className="text-sm text-muted-foreground">
                                        語音搜尋優化: {item.searchOptimized}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      {/* 分析比較內容保持相同 */}
                      <TabsContent value="analysis" className="mt-6">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 問題來源分布 */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">問題來源分析</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {(() => {
                                  const sources = resultData.smartQuestionAnalysis?.optimizedFinalQuestions?.reduce((acc, item) => {
                                    acc[item.source] = (acc[item.source] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>) || {};
                                  
                                  return (
                                    <div className="space-y-2">
                                      {Object.entries(sources).map(([source, count]) => (
                                        <div key={source} className="flex items-center justify-between">
                                          <span className="text-sm">
                                            {source === 'content-analysis' ? '內容分析生成' :
                                             source === 'paa' ? 'Google PAA' : '混合優化'}
                                          </span>
                                          <Badge variant="outline" className="text-xs">{count} 個</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </CardContent>
                            </Card>

                            {/* 問題層次分布 */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">問題層次分析</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {(() => {
                                  const categories = resultData.smartQuestionAnalysis?.optimizedFinalQuestions?.reduce((acc, item) => {
                                    acc[item.category] = (acc[item.category] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>) || {};
                                  
                                  return (
                                    <div className="space-y-2">
                                      {Object.entries(categories).map(([category, count]) => (
                                        <div key={category} className="flex items-center justify-between">
                                          <span className="text-sm flex items-center">
                                            {getCategoryIcon(category)}
                                            <span className="ml-2">{category}級問題</span>
                                          </span>
                                          <Badge variant="outline" className="text-xs">{count} 個</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </div>

                          {/* 智慧分析優勢 */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                                智慧分析優勢
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <p className="font-medium">✅ 內容深度理解</p>
                                  <p className="text-muted-foreground">不只看標題，全面分析網頁內容主題和用戶需求</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="font-medium">✅ 用戶旅程導向</p>
                                  <p className="text-muted-foreground">按入門→實用→進階層次生成問題，符合用戶認知過程</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="font-medium">✅ 痛點精準識別</p>
                                  <p className="text-muted-foreground">基於內容分析識別真實用戶痛點，生成切中要害的問題</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="font-medium">✅ 智慧優化整合</p>
                                  <p className="text-muted-foreground">結合內容分析和Google PAA，兼顧相關性和搜尋熱度</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* 關鍵字分析 */}
              {resultData.keywords && resultData.keywords.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Search className="mr-3 h-6 w-6" />
                      提取的關鍵字
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {resultData.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* FAQ Schema 結果 */}
              {resultData.faqSchema && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-xl">生成的智慧 FAQ Schema (JSON-LD)</span>
                      <CopyButton textToCopy={resultData.faqSchema} size="sm" variant="outline">
                        複製 Schema
                      </CopyButton>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      readOnly
                      value={resultData.faqSchema}
                      className="h-64 lg:h-80 text-sm bg-muted/30 font-mono"
                    />
                  </CardContent>
                </Card>
              )}

              {/* 純文字版本 */}
              {resultData.plainTextFaq && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="flex items-center text-xl">
                        <TextQuote className="mr-3 h-6 w-6" />
                        智慧生成 FAQ（純文字版）
                      </span>
                      <CopyButton textToCopy={resultData.plainTextFaq} size="sm" variant="outline">
                        複製文字
                      </CopyButton>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      readOnly
                      value={resultData.plainTextFaq}
                      className="h-64 lg:h-80 text-sm bg-muted/30 whitespace-pre-line"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}