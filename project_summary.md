專案名稱：SchemaFAQ Generator

工作流程：
1. 使用者輸入 Serper API Key 和 Gemini API Key。
2. 使用者提供一個目標 URL。
3. 系統從目標 URL 的標題和內容中提取關鍵字。
4. 使用 Serper API 和提取的關鍵字獲取 'People Also Ask' 資料。
5. 基於提取的內容和 'People Also Ask' 資料生成 FAQ Schema 結構化資料（JSON-LD）。

採用的語言模型：
- gpt4o-mini（用於關鍵字提取和 FAQ Schema 生成）

程式框架：
- Next.js（React 框架，用於構建前端應用）
- Genkit（用於生成式 AI 功能）
- Tailwind CSS（用於樣式設計）

其他關鍵技術和工具：
- React Hook Form（用於表單處理）
- Zod（用於表單驗證）
- Radix UI（用於 UI 元件）
- Lucide React（用於圖示）

專案結構：
- src/app：包含應用程式的主要邏輯和頁面元件。
- src/components：包含可重用的 UI 元件。
- src/lib：包含工具函數和模式定義。
- src/ai：包含 AI 相關的功能和流程。

樣式指南：
- 主要顏色：淺灰色 (#F5F5F5)
- 次要顏色：白色 (#FFFFFF)
- 強調色：藍綠色 (#008080)
- 使用乾淨和可讀的無襯線字體
- 簡單和一致的圖示用於輸入欄位和操作
- 清晰和結構化的佈局，分為輸入、處理和輸出部分
