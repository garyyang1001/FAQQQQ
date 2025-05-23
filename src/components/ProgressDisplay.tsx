// src/components/ProgressDisplay.tsx
// 實時進度顯示組件

'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon?: string;
  details?: string;
  startTime?: number;
  endTime?: number;
}

interface ProgressDisplayProps {
  sessionId: string;
  onComplete?: (success: boolean) => void;
  onError?: (error: string) => void;
}

export default function ProgressDisplay({ sessionId, onComplete, onError }: ProgressDisplayProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'fetch',
      title: '🔥 網頁內容抓取',
      description: '使用 Firecrawl 獲取網頁內容',
      status: 'pending'
    },
    {
      id: 'analyze',
      title: '🔍 內容分析',
      description: '進行基礎內容分析與關鍵字提取',
      status: 'pending'
    },
    {
      id: 'search',
      title: '🔎 相關問題搜尋',
      description: '搜尋 Google People Also Ask 問題',
      status: 'pending'
    },
    {
      id: 'generate',
      title: '🧠 智慧問題生成',
      description: '使用 AI 生成深度分析問題',
      status: 'pending'
    },
    {
      id: 'schema',
      title: '📝 FAQ Schema 生成',
      description: '創建結構化資料標記',
      status: 'pending'
    },
    {
      id: 'format',
      title: '📋 格式化輸出',
      description: '生成純文字版本',
      status: 'pending'
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('準備開始處理...');
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // 建立 SSE 連接
    const eventSource = new EventSource(`/api/progress?sessionId=${sessionId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ 進度追蹤連接已建立');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleProgressUpdate(data);
      } catch (error) {
        console.error('解析進度事件失敗:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE 連接錯誤:', error);
      setIsConnected(false);
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE 連接已關閉');
      }
    };

    // 清理函數
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [sessionId]);

  const handleProgressUpdate = (data: any) => {
    console.log('📡 收到進度更新:', data);
    
    if (data.step === 'connected') {
      setCurrentMessage('已連接到進度追蹤服務');
      return;
    }

    // 更新當前消息
    setCurrentMessage(data.message);

    // 映射步驟 ID
    const stepMapping: Record<string, string> = {
      'fetch-start': 'fetch',
      'fetch-success': 'fetch',
      'analyze-start': 'analyze', 
      'analyze-complete': 'analyze',
      'search-start': 'search',
      'search-complete': 'search',
      'generate-start': 'generate',
      'generate-complete': 'generate',
      'schema-start': 'schema',
      'schema-complete': 'schema',
      'format-start': 'format',
      'format-complete': 'format',
      'complete': 'format'
    };

    const stepId = stepMapping[data.step];
    if (!stepId) return;

    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (step.id === stepId) {
          const now = Date.now();
          let newStatus: ProgressStep['status'] = step.status;
          let endTime = step.endTime;

          if (data.status === 'start') {
            newStatus = 'running';
          } else if (data.status === 'complete') {
            newStatus = 'completed';
            endTime = now;
          } else if (data.status === 'error') {
            newStatus = 'error';
            endTime = now;
            setHasError(true);
          }

          return {
            ...step,
            status: newStatus,
            details: data.details || step.details,
            icon: data.icon || step.icon,
            startTime: newStatus === 'running' ? now : step.startTime,
            endTime
          };
        }
        return step;
      })
    );

    // 檢查是否完成
    if (data.step === 'complete') {
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        onComplete?.(true);
      }, 1000);
    }

    // 檢查是否有錯誤
    if (data.status === 'error') {
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        onError?.(data.message);
      }, 1000);
    }
  };

  const getStepIcon = (step: ProgressStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else if (step.status === 'running') {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getElapsedTime = (step: ProgressStep) => {
    if (!step.startTime) return '';
    const endTime = step.endTime || Date.now();
    const elapsed = Math.round((endTime - step.startTime) / 1000);
    return `${elapsed}s`;
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 標題和連接狀態 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">處理進度</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {isConnected ? '已連接' : '未連接'}
          </span>
        </div>
      </div>

      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">整體進度</span>
          <span className="text-sm text-gray-500">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 當前消息 */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">{currentMessage}</p>
      </div>

      {/* 步驟列表 */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
              step.status === 'running' 
                ? 'bg-blue-50 border border-blue-200' 
                : step.status === 'completed'
                ? 'bg-green-50 border border-green-200'
                : step.status === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {/* 步驟圖標 */}
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(step)}
            </div>

            {/* 步驟內容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-800' :
                  step.status === 'error' ? 'text-red-800' :
                  step.status === 'running' ? 'text-blue-800' :
                  'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                {step.startTime && (
                  <span className="text-xs text-gray-500 ml-2">
                    {getElapsedTime(step)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
              {step.details && (
                <p className="text-xs text-gray-500 mt-1">{step.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 錯誤狀態 */}
      {hasError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800">處理過程中發生錯誤，請檢查日誌或重試。</p>
          </div>
        </div>
      )}
    </div>
  );
}