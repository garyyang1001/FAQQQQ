# Todo List

1. 將 Gemini API 替換為 OpenRouter API，並採用 meta-llama/llama-4-maverick:free 模型。
2. 安裝必要的套件以支援 OpenRouter API，包括 `openai`。
3. 更新了以下檔案以使用 OpenRouter API：
   - `src/ai/flows/generate-faq-schema.ts`
   - `src/ai/flows/extract-keywords.ts`
   - `src/ai/flows/format-faq-to-text.ts`
   - `src/app/actions.ts`
4. 將前端欄位中的 Gemini API Key 改為 OpenRouter API Key。
5. 在本地端成功啟用專案，使用 `npm run dev` 命令。
6. 設定 `OPENROUTER_API_KEY` 環境變數於 `.env` 檔案中。
7. 將 API Key 儲存於 sessionStorage 中，以避免硬編碼或使用 .env 檔案。
