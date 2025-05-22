// src/lib/ai-model-configs.ts
// 統一管理所有 AI 模型的參數設定

export const AI_MODEL_CONFIGS = {
  // 關鍵字提取：需要高度一致性和準確性
  EXTRACT_KEYWORDS: {
    model: 'google/gemma-3-27b-it:free',
    temperature: 0.2,
    top_p: 0.9,
    frequency_penalty: 0.1,
    max_tokens: 500
  },

  // FAQ 格式化：需要極高的一致性，避免格式錯誤
  FORMAT_FAQ: {
    model: 'google/gemma-3-27b-it:free',
    temperature: 0.1,
    top_p: 0.8,
    presence_penalty: 0.1,
    max_tokens: 3000
  },

  // FAQ Schema 生成：平衡創意和準確性
  GENERATE_FAQ_SCHEMA: {
    model: 'google/gemma-3-27b-it:free',
    temperature: 0.3,
    top_p: 0.95,
    frequency_penalty: 0.2,
    presence_penalty: 0.1,
    max_tokens: 2000
  },

  // 內容分析：需要準確的洞察
  CONTENT_ANALYSIS: {
    model: 'google/gemma-3-27b-it:free',
    temperature: 0.3,
    top_p: 0.9,
    frequency_penalty: 0.15,
    max_tokens: 1500
  },

  // 智慧問題生成：允許創意但保持相關性
  SMART_QUESTIONS: {
    model: 'google/gemma-3-27b-it:free',
    temperature: 0.5,
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.2,
    max_tokens: 2000
  }
};