// 步驟3: 創建 src/components/enhanced-faq-page-content.tsx
// 這是增強版的用戶界面組件（簡化版，容易理解）

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

import { 
  Loader2, AlertTriangle, KeyRound, Link2, 
  Sparkles, TextQuote, BarChart3, Target
} from 'lucide-react';

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

    console.log('🚀 開始處理請求...');
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
      });
      console.log('✅ 處理完成！');
    }
    setIsLoading(false);
  }

  // SEO 分數的顏色
  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            增強版 FAQ 產生器
          </h1>
          <p className="text-xl text-muted-foreground">
            深度內容分析 × AI 語意理解 × SEO 最佳化
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
              請提供 API 金鑰和目標網址來生成增強版 FAQ 和 SEO 分析
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
                      分析中...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      開始增強分析
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

            {/* 關鍵字分析 */}
            {resultData.keywords && resultData.keywords.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>提取的關鍵字</CardTitle>
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
                    生成的 FAQ Schema (JSON-LD)
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
                      純文字版 FAQ
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