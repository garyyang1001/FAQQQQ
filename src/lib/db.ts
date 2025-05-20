// src/lib/db.ts
// 由於使用者不希望使用 Firebase，因此移除 Firebase 相關程式碼
export const registerUser = async (formData: { email: string; password: string }) => {
  // 在這裡你可以實現使用 NextAuth.js 或其他身份驗證解決方案的註冊邏輯
  console.log('模擬註冊用戶：', formData);
  return Promise.resolve(); // 模擬 async 成功
};
