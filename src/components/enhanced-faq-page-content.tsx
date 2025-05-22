// 智慧版 src/components/enhanced-faq-page-content.tsx
// 顯示智慧問題分析結果的前端組件

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
  Layers, Search, Zap
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
  // 新增：智慧問題分析結果
  smartQuestionAnalysis?: SmartQuestionAnalysis;
}

export function EnhancedFaqPageContent() {
  // 狀態管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<EnhancedResultData | null>(null);

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
      case 'content-analysis': return "bg-blue-100 text-blue-800";
      case 'paa': return "bg-green-100 text-green-800";
      case 'hybrid': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
            <Brain className="mr-3 h-10 w-10" />
            智慧版 FAQ 產生器
          </h1>
          <p className="text-xl text-muted-foreground">
            深度內容分析 × AI 語意理解 × 智慧問題生成 × SEO 最佳化
          </p>
        </div>

        {/* 輸入表單 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              輸入資訊
            </CardTitle>
            <CardDescription>
              提供 API 金鑰和目標網址，開始智慧化 FAQ 生成和深度 SEO 分析
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="serperApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <KeyRound className="mr-2 h-4 w-4" />
                        Serper API Key
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="輸入您的 Serper API Key" {...field} />
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
                      <FormLabel className="flex items-center">
                        <Sparkles className="mr-2 h-4 w-4" />
                        OpenRouter API Key
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="輸入您的 OpenRouter API Key" {...field} />
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
                      <FormLabel className="flex items-center">
                        <Link2 className="mr-2 h-4 w-4" />
                        目標網址
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/your-article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      智慧分析中...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
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
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>錯誤</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 結果顯示 */}
        {resultData && (
          <>
            {/* SEO 分數卡片 */}
            {resultData.seoInsights && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-6 w-6 text-primary" />
                    SEO 分析結果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${getSeoScoreColor(resultData.seoInsights.score)}`}>
                      {resultData.seoInsights.score}/100
                    </div>
                    <p className="text-muted-foreground">整體 SEO 分數</p>
                    <Progress value={resultData.seoInsights.score} className="mt-2" />
                  </div>
                  
                  {resultData.seoInsights.improvements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">改進建議:</h3>
                      <div className="space-y-2">
                        {resultData.seoInsights.improvements.slice(0, 3).map((improvement, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{improvement.issue}</AlertTitle>
                            <AlertDescription>{improvement.suggestion}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 🧠 智慧問題分析結果 */}
            {resultData.smartQuestionAnalysis && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-6 w-6 text-primary" />
                    智慧問題分析
                  </CardTitle>
                  <CardDescription>
                    基於內容深度分析和用戶需求洞察的智慧問題生成
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="insights" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="insights">內容洞察</TabsTrigger>
                      <TabsTrigger value="layered">分層問題</TabsTrigger>
                      <TabsTrigger value="optimized">優化問題</TabsTrigger>
                      <TabsTrigger value="analysis">分析比較</TabsTrigger>
                    </TabsList>

                    {/* 內容洞察 Tab */}
                    <TabsContent value="insights" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <Layers className="mr-2 h-5 w-5" />
                              主要話題
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {resultData.smartQuestionAnalysis.contentInsights.mainTopics?.map((topic, index) => (
                                <Badge key={index} variant="default">{topic}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <Users className="mr-2 h-5 w-5" />
                              用戶目標
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {resultData.smartQuestionAnalysis.contentInsights.userGoals?.map((goal, index) => (
                                <Badge key={index} variant="secondary">{goal}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <AlertTriangle className="mr-2 h-5 w-5" />
                              用戶痛點
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {resultData.smartQuestionAnalysis.contentInsights.painPoints?.map((point, index) => (
                                <Badge key={index} variant="destructive">{point}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <Zap className="mr-2 h-5 w-5" />
                              內容類型
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="outline" className="text-lg">
                              {resultData.smartQuestionAnalysis.contentInsights.contentType}
                            </Badge>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* 分層問題 Tab */}
                    <TabsContent value="layered" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 入門層問題 */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <Users className="mr-2 h-5 w-5 text-blue-600" />
                              入門層問題
                            </CardTitle>
                            <CardDescription>剛接觸該主題的用戶</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {resultData.smartQuestionAnalysis.layeredQuestions.beginner?.map((item, index) => (
                              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                <p className="font-medium text-sm">{item.question}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* 實用層問題 */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                              實用層問題
                            </CardTitle>
                            <CardDescription>有基礎了解，想要具體方法</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {resultData.smartQuestionAnalysis.layeredQuestions.intermediate?.map((item, index) => (
                              <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                                <p className="font-medium text-sm">{item.question}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* 進階層問題 */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                              進階層問題
                            </CardTitle>
                            <CardDescription>準備採取行動的用戶</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {resultData.smartQuestionAnalysis.layeredQuestions.advanced?.map((item, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg">
                                <p className="font-medium text-sm">{item.question}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* 優化問題 Tab */}
                    <TabsContent value="optimized" className="space-y-4">
                      <div className="space-y-3">
                        {resultData.smartQuestionAnalysis.optimizedFinalQuestions?.map((item, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getCategoryIcon(item.category)}
                                    <Badge variant="outline">{item.category}</Badge>
                                    <Badge className={getSourceColor(item.source)}>
                                      {item.source === 'content-analysis' ? '內容分析' : 
                                       item.source === 'paa' ? 'Google PAA' : '混合優化'}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      優先級: {item.priority}/10
                                    </span>
                                  </div>
                                  <p className="font-medium">{item.question}</p>
                                  {item.searchOptimized !== item.question && (
                                    <p className="text-sm text-muted-foreground mt-1">
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
                    <TabsContent value="analysis" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 問題來源分布 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">問題來源分析</CardTitle>
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
                                      <Badge variant="outline">{count} 個</Badge>
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
                            <CardTitle className="text-lg">問題層次分析</CardTitle>
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
                                      <Badge variant="outline">{count} 個</Badge>
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
                          <CardTitle className="text-lg flex items-center">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                            智慧分析優勢
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* 關鍵字分析 */}
            {resultData.keywords && resultData.keywords.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    提取的關鍵字
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resultData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ Schema 結果 */}
            {resultData.faqSchema && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    生成的智慧 FAQ Schema (JSON-LD)
                    <CopyButton textToCopy={resultData.faqSchema} size="sm" variant="outline">
                      複製 Schema
                    </CopyButton>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    readOnly
                    value={resultData.faqSchema}
                    className="h-64 text-xs bg-muted/30"
                  />
                </CardContent>
              </Card>
            )}

            {/* 純文字版本 */}
            {resultData.plainTextFaq && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
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
                    className="h-64 text-sm bg-muted/30 whitespace-pre-line"
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}