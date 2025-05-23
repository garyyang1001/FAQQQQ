// 修復進度顯示問題：使用帶進度功能的組件
// src/app/enhanced/page.tsx

import EnhancedFaqPageWithProgress from '@/components/EnhancedFaqPageWithProgress';

export default function EnhancedPage() {
  return (
    <main className="min-h-screen">
      <EnhancedFaqPageWithProgress />
    </main>
  );
}

export const metadata = {
  title: '增強版 FAQ Schema Generator - 深度內容分析',
  description: '使用 AI 驅動的語意分析和完整 SEO 最佳化功能，生成高品質的 FAQ 結構化資料。',
};