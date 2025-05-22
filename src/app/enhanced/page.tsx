// 步驟2: 創建 src/app/enhanced/page.tsx
// 這是增強版的頁面，用戶在瀏覽器中看到的界面

import { EnhancedFaqPageContent } from '@/components/enhanced-faq-page-content';

export default function EnhancedPage() {
  return (
    <main className="min-h-screen">
      <EnhancedFaqPageContent />
    </main>
  );
}

export const metadata = {
  title: '增強版 FAQ Schema Generator - 深度內容分析',
  description: '使用 AI 驅動的語意分析和完整 SEO 最佳化功能，生成高品質的 FAQ 結構化資料。',
};