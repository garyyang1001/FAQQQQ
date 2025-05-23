// src/app/api/progress/route.ts
// Server-Sent Events API 端點用於實時進度傳輸

import { NextRequest } from 'next/server';

// 全域的進度事件管理器
class ProgressEventManager {
  private static instance: ProgressEventManager;
  private sessions: Map<string, ReadableStreamDefaultController> = new Map();

  static getInstance(): ProgressEventManager {
    if (!ProgressEventManager.instance) {
      ProgressEventManager.instance = new ProgressEventManager();
    }
    return ProgressEventManager.instance;
  }

  addSession(sessionId: string, controller: ReadableStreamDefaultController) {
    this.sessions.set(sessionId, controller);
  }

  removeSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  sendProgress(sessionId: string, data: ProgressEvent) {
    const controller = this.sessions.get(sessionId);
    if (controller) {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error('發送進度事件失敗:', error);
        this.removeSession(sessionId);
      }
    }
  }

  completeSession(sessionId: string) {
    const controller = this.sessions.get(sessionId);
    if (controller) {
      try {
        controller.close();
      } catch (error) {
        console.error('關閉連接失敗:', error);
      } finally {
        this.removeSession(sessionId);
      }
    }
  }
}

export interface ProgressEvent {
  step: string;
  status: 'start' | 'progress' | 'complete' | 'error';
  message: string;
  icon?: string;
  details?: string;
  progress?: number; // 0-100
  timestamp: number;
}

// 導出給其他模塊使用的進度發送函數
export function sendProgressUpdate(sessionId: string, event: Omit<ProgressEvent, 'timestamp'>) {
  const manager = ProgressEventManager.getInstance();
  manager.sendProgress(sessionId, {
    ...event,
    timestamp: Date.now()
  });
}

export function completeProgressSession(sessionId: string) {
  const manager = ProgressEventManager.getInstance();
  manager.completeSession(sessionId);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // 設置 SSE 標頭
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      };

      // 發送初始連接確認
      const initMessage = `data: ${JSON.stringify({
        step: 'connected',
        status: 'start',
        message: '已連接到進度追蹤服務',
        icon: '🔗',
        timestamp: Date.now()
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(initMessage));

      // 註冊到全域管理器
      const manager = ProgressEventManager.getInstance();
      manager.addSession(sessionId, controller);

      // 設置心跳，防止連接超時
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          clearInterval(heartbeat);
          manager.removeSession(sessionId);
        }
      }, 30000); // 每30秒發送心跳

      // 清理函數
      return () => {
        clearInterval(heartbeat);
        manager.removeSession(sessionId);
      };
    },
    cancel() {
      const manager = ProgressEventManager.getInstance();
      manager.removeSession(sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}