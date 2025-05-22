// RWD 優化版 src/components/enhanced-faq-page-content.tsx
// 完全響應式的智慧 FAQ 生成器

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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { 
  Loader2, AlertTriangle, KeyRound, Link2, 
  Sparkles, TextQuote, BarChart3, Target,
  Brain, Users, Lightbulb, TrendingUp, CheckCircle,
  Layers, Search, Zap, Menu, Eye, EyeOff
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          
          {/* 頁面標題 - 響應式字體大小和間距 */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                智慧版 FAQ 產生器
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto px-4">
              深度內容分析 × AI 語意理解 × 智慧問題生成 × SEO 最佳化
            </p>
          </div>

          {/* 輸入表單 - 響應式設計 */}
          <Card className="mb-6 sm:mb-8 shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="text-lg sm:text-xl">輸入資訊</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                提供 API 金鑰和目標網址，開始智慧化 FAQ 生成和深度 SEO 分析
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4 sm:space-y-6">
                  
                  {/* API Keys 區域 - 可摺疊設計 */}
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
                            顯示
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {showApiKeys && (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
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
                        <FormLabel className="flex items-center text-sm sm:text-base">
                          <Link2 className="mr-2 h-4 w-4" />
                          目標網址
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/your-article" 
                            className="text-sm sm:text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 提交按鈕 - 響應式大小 */}
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full py-2 sm:py-3 text-sm sm:text-base font-medium"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        智慧分析中...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        開始智慧增強分析
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Form>
          </Card>

          {/* 錯誤顯示 */}
          {error && (
            <Alert variant="destructive" className="mb-6 sm:mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>錯誤</AlertTitle>
              <AlertDescription className="text-sm sm:text-base break-words">{error}</AlertDescription>
            </Alert>
          )}

          {/* 結果顯示 */}
          {resultData && (
            <div className="space-y-6 sm:space-y-8">
              
              {/* SEO 分數卡片 - 響應式佈局 */}
              {resultData.seoInsights && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      <span className="text-lg sm:text-xl">SEO 分析結果</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* SEO 分數 - 響應式顯示 */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${getSeoScoreColor(resultData.seoInsights.score)}`}>
                        {resultData.seoInsights.score}/100
                      </div>
                      <p className="text-muted-foreground text-sm sm:text-base">整體 SEO 分數</p>
                      <Progress value={resultData.seoInsights.score} className="mt-2 sm:mt-3 h-2 sm:h-3" />
                    </div>
                    
                    {/* 改進建議 - 響應式網格 */}
                    {resultData.seoInsights.improvements.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">改進建議:</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          {resultData.seoInsights.improvements.slice(0, 6).map((improvement, index) => (
                            <Alert key={index} className="text-xs sm:text-sm">
                              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <AlertTitle className="text-xs sm:text-sm">{improvement.issue}</AlertTitle>
                              <AlertDescription className="text-xs sm:text-sm">{improvement.suggestion}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 智慧問題分析結果 - 響應式 Tabs */}
              {resultData.smartQuestionAnalysis && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      <span className="text-lg sm:text-xl">智慧問題分析</span>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      基於內容深度分析和用戶需求洞察的智慧問題生成
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="insights" className="w-full">
                      {/* 響應式 Tabs List */}
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                        <TabsTrigger value="insights" className="text-xs sm:text-sm px-2 py-2">
                          內容洞察
                        </TabsTrigger>
                        <TabsTrigger value="layered" className="text-xs sm:text-sm px-2 py-2">
                          分層問題
                        </TabsTrigger>
                        <TabsTrigger value="optimized" className="text-xs sm:text-sm px-2 py-2">
                          優化問題
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="text-xs sm:text-sm px-2 py-2">
                          分析比較
                        </TabsTrigger>
                      </TabsList>

                      {/* 內容洞察 Tab */}
                      <TabsContent value="insights" className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <Layers className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                主要話題
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {resultData.smartQuestionAnalysis.contentInsights.mainTopics?.map((topic, index) => (
                                  <Badge key={index} variant="default" className="text-xs">{topic}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                用戶目標
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {resultData.smartQuestionAnalysis.contentInsights.userGoals?.map((goal, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">{goal}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <AlertTriangle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                用戶痛點
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {resultData.smartQuestionAnalysis.contentInsights.painPoints?.map((point, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">{point}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                內容類型
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Badge variant="outline" className="text-sm sm:text-base">
                                {resultData.smartQuestionAnalysis.contentInsights.contentType}
                              </Badge>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* 分層問題 Tab */}
                      <TabsContent value="layered" className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                          {/* 入門層問題 */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                入門層問題
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm">剛接觸該主題的用戶</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resultData.smartQuestionAnalysis.layeredQuestions.beginner?.map((item, index) => (
                                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                  <p className="font-medium text-xs sm:text-sm">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* 實用層問題 */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <Lightbulb className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                                實用層問題
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm">有基礎了解，想要具體方法</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resultData.smartQuestionAnalysis.layeredQuestions.intermediate?.map((item, index) => (
                                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                  <p className="font-medium text-xs sm:text-sm">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* 進階層問題 */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                進階層問題
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm">準備採取行動的用戶</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resultData.smartQuestionAnalysis.layeredQuestions.advanced?.map((item, index) => (
                                <div key={index} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                  <p className="font-medium text-xs sm:text-sm">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* 優化問題 Tab */}
                      <TabsContent value="optimized" className="mt-4 sm:mt-6">
                        <div className="space-y-3 sm:space-y-4">
                          {resultData.smartQuestionAnalysis.optimizedFinalQuestions?.map((item, index) => (
                            <Card key={index}>
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
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
                                    <p className="font-medium text-sm sm:text-base">{item.question}</p>
                                    {item.searchOptimized !== item.question && (
                                      <p className="text-xs sm:text-sm text-muted-foreground">
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

                      {/* 分析比較 Tab */}
                      <TabsContent value="analysis" className="mt-4 sm:mt-6">
                        <div className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* 問題來源分布 */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm sm:text-base">問題來源分析</CardTitle>
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
                                          <span className="text-xs sm:text-sm">
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
                                <CardTitle className="text-sm sm:text-base">問題層次分析</CardTitle>
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
                                          <span className="text-xs sm:text-sm flex items-center">
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
                              <CardTitle className="text-sm sm:text-base flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                智慧分析優勢
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
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

              {/* 關鍵字分析 - 響應式 Badge */}
              {resultData.keywords && resultData.keywords.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Search className="mr-2 h-5 w-5" />
                      提取的關鍵字
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {resultData.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs sm:text-sm">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* FAQ Schema 結果 - 響應式文字區域 */}
              {resultData.faqSchema && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-lg sm:text-xl">生成的智慧 FAQ Schema (JSON-LD)</span>
                      <CopyButton textToCopy={resultData.faqSchema} size="sm" variant="outline">
                        複製 Schema
                      </CopyButton>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      readOnly
                      value={resultData.faqSchema}
                      className="h-48 sm:h-64 lg:h-80 text-xs sm:text-sm bg-muted/30 font-mono"
                    />
                  </CardContent>
                </Card>
              )}

              {/* 純文字版本 - 響應式文字區域 */}
              {resultData.plainTextFaq && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="flex items-center text-lg sm:text-xl">
                        <TextQuote className="mr-2 h-5 w-5" />
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
                      className="h-48 sm:h-64 lg:h-80 text-xs sm:text-sm bg-muted/30 whitespace-pre-line"
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