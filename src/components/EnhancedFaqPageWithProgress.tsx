// src/components/EnhancedFaqPageWithProgress.tsx
// 集成進度顯示的增強版 FAQ 頁面組件

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateEnhancedFaqAction } from '@/app/enhanced-actions';
import { faqFormSchema, type FaqFormValues } from '@/lib/schemas';
import ProgressDisplay from './ProgressDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from './copy-button';

interface ProcessingState {
  isProcessing: boolean;
  sessionId: string | null;
  showProgress: boolean;
}

export default function EnhancedFaqPageWithProgress() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    sessionId: null,
    showProgress: false
  });

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      url: '',
      openRouterApiKey: '',
      serperApiKey: '',
      firecrawlApiKey: '',
    },
  });

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const onSubmit = async (values: FaqFormValues) => {
    try {
      setError(null);
      setResult(null);
      
      // 生成新的會話 ID
      const sessionId = generateSessionId();
      
      setProcessing({
        isProcessing: true,
        sessionId,
        showProgress: true
      });

      // 呼叫後端處理，傳入 sessionId
      const response = await generateEnhancedFaqAction(values, sessionId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err: any) {
      console.error('處理錯誤:', err);
      setError(err.message || '發生未知錯誤');
    } finally {
      setProcessing({
        isProcessing: false,
        sessionId: null,
        showProgress: false
      });
    }
  };

  const handleProgressComplete = (success: boolean) => {
    console.log('進度完成:', success);
    setProcessing(prev => ({
      ...prev,
      isProcessing: false,
      showProgress: false
    }));
  };

  const handleProgressError = (errorMsg: string) => {
    console.error('進度錯誤:', errorMsg);
    setError(errorMsg);
    setProcessing({
      isProcessing: false,
      sessionId: null,
      showProgress: false
    });
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setProcessing({
      isProcessing: false,
      sessionId: null,
      showProgress: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 標題區域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 增強版 FAQ Schema Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            使用 AI 驅動的深度內容分析，生成高品質的 FAQ 結構化資料，提升您的 SEO 效果
          </p>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：輸入表單 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>目標網址</span>
                </CardTitle>
                <CardDescription>
                  輸入要分析的網頁網址和必要的 API 金鑰
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* URL 輸入 */}
                  <div>
                    <Label htmlFor="url">目標網址</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      {...form.register('url')}
                      disabled={processing.isProcessing}
                    />
                    {form.formState.errors.url && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.url.message}
                      </p>
                    )}
                  </div>

                  {/* OpenRouter API Key */}
                  <div>
                    <Label htmlFor="openRouterApiKey">OpenRouter API Key</Label>
                    <Input
                      id="openRouterApiKey"
                      type="password"
                      placeholder="sk-or-..."
                      {...form.register('openRouterApiKey')}
                      disabled={processing.isProcessing}
                    />
                    {form.formState.errors.openRouterApiKey && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.openRouterApiKey.message}
                      </p>
                    )}
                  </div>

                  {/* Serper API Key */}
                  <div>
                    <Label htmlFor="serperApiKey">Serper API Key</Label>
                    <Input
                      id="serperApiKey"
                      type="password"
                      placeholder="..."
                      {...form.register('serperApiKey')}
                      disabled={processing.isProcessing}
                    />
                    {form.formState.errors.serperApiKey && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.serperApiKey.message}
                      </p>
                    )}
                  </div>

                  {/* Firecrawl API Key */}
                  <div>
                    <Label htmlFor="firecrawlApiKey">Firecrawl API Key</Label>
                    <Input
                      id="firecrawlApiKey"
                      type="password"
                      placeholder="fc-..."
                      {...form.register('firecrawlApiKey')}
                      disabled={processing.isProcessing}
                    />
                    {form.formState.errors.firecrawlApiKey && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.firecrawlApiKey.message}
                      </p>
                    )}
                  </div>

                  {/* 提交按鈕 */}
                  <Button
                    type="submit"
                    disabled={processing.isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {processing.isProcessing ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>處理中...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>🚀</span>
                        <span>開始智慧增強分析</span>
                      </span>
                    )}
                  </Button>

                  {/* 重置按鈕 */}
                  {(result || error) && !processing.isProcessing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-full"
                    >
                      重新開始
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 右側：進度顯示和結果 */}
          <div className="lg:col-span-2">
            {/* 進度顯示 */}
            {processing.showProgress && processing.sessionId && (
              <div className="mb-8">
                <ProgressDisplay
                  sessionId={processing.sessionId}
                  onComplete={handleProgressComplete}
                  onError={handleProgressError}
                />
              </div>
            )}

            {/* 錯誤顯示 */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  <strong>錯誤：</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* 結果顯示 */}
            {result && !processing.isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🎉</span>
                    <span>FAQ 生成完成</span>
                  </CardTitle>
                  <CardDescription>
                    以下是為您生成的智慧化 FAQ 內容
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="schema" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="schema">JSON-LD Schema</TabsTrigger>
                      <TabsTrigger value="text">純文字版本</TabsTrigger>
                      <TabsTrigger value="keywords">關鍵字</TabsTrigger>
                      <TabsTrigger value="analysis">智慧分析</TabsTrigger>
                    </TabsList>

                    {/* JSON-LD Schema */}
                    <TabsContent value="schema" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">JSON-LD FAQ Schema</h3>
                          <CopyButton textToCopy={result.faqSchema}>
                            複製 Schema
                          </CopyButton>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                          <code>{JSON.stringify(JSON.parse(result.faqSchema), null, 2)}</code>
                        </pre>
                      </div>
                    </TabsContent>

                    {/* 純文字版本 */}
                    <TabsContent value="text" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">純文字 FAQ</h3>
                          <CopyButton textToCopy={result.plainTextFaq}>
                            複製文字
                          </CopyButton>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm">{result.plainTextFaq}</pre>
                        </div>
                      </div>
                    </TabsContent>

                    {/* 關鍵字 */}
                    <TabsContent value="keywords" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">關鍵字分析</h3>
                        <div className="grid gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">主要關鍵字</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords?.map((keyword: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {result.enhancedKeywords?.semantic && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">語意關鍵字</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.enhancedKeywords.semantic.map((keyword: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* 智慧分析 */}
                    <TabsContent value="analysis" className="mt-4">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">智慧分析結果</h3>
                        
                        {result.smartQuestionAnalysis && (
                          <div className="grid gap-6">
                            {/* 內容洞察 */}
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">內容洞察</h4>
                              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                <p><strong>主要話題:</strong> {result.smartQuestionAnalysis.contentInsights.mainTopics?.join('、')}</p>
                                <p><strong>用戶目標:</strong> {result.smartQuestionAnalysis.contentInsights.userGoals?.join('、')}</p>
                                <p><strong>痛點:</strong> {result.smartQuestionAnalysis.contentInsights.painPoints?.join('、')}</p>
                                <p><strong>內容類型:</strong> {result.smartQuestionAnalysis.contentInsights.contentType}</p>
                              </div>
                            </div>

                            {/* 問題生成統計 */}
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">問題生成統計</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {result.smartQuestionAnalysis.layeredQuestions.beginner?.length || 0}
                                  </div>
                                  <div className="text-sm text-green-600">入門問題</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {result.smartQuestionAnalysis.layeredQuestions.intermediate?.length || 0}
                                  </div>
                                  <div className="text-sm text-blue-600">實用問題</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {result.smartQuestionAnalysis.layeredQuestions.advanced?.length || 0}
                                  </div>
                                  <div className="text-sm text-purple-600">進階問題</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SEO 洞察 */}
                        {result.seoInsights && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">SEO 評分</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span>整體 SEO 評分</span>
                                <span className="text-2xl font-bold text-yellow-600">
                                  {result.seoInsights.score}/100
                                </span>
                              </div>
                              <div className="w-full bg-yellow-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-600 h-2 rounded-full"
                                  style={{ width: `${result.seoInsights.score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* 空狀態 */}
            {!processing.showProgress && !result && !error && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-6xl">🤖</div>
                    <h3 className="text-xl font-semibold text-gray-700">準備開始 AI 分析</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      輸入網址和 API 金鑰，讓我們為您生成專業的 FAQ 結構化資料
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}