// src/app/register/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不相符');
      setIsLoading(false);
      return;
    }

    try {
      // 創建使用者帳號
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // 儲存額外的使用者資料到 Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: formData.displayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: 'user' // 預設角色
      });

      // 註冊成功，導向首頁
      router.push('/');
    } catch (error: any) {
      console.error('註冊錯誤:', error);
      
      // 處理常見錯誤
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('此電子郵件已被使用');
          break;
        case 'auth/invalid-email':
          setError('無效的電子郵件格式');
          break;
        case 'auth/weak-password':
          setError('密碼強度不足（至少需要 6 個字元）');
          break;
        default:
          setError('註冊失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center">
            <UserPlus className="mr-2 h-6 w-6" />
            註冊新帳號
          </CardTitle>
          <CardDescription>
            輸入您的資料以創建新帳號
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">顯示名稱</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="您的名稱"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  註冊中...
                </>
              ) : (
                '註冊'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            已經有帳號了？{' '}
            <a href="/login" className="text-primary hover:underline">
              立即登入
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================================
// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // 更新最後登入時間
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date().toISOString()
      });

      // 登入成功，導向首頁
      router.push('/');
    } catch (error: any) {
      console.error('登入錯誤:', error);
      
      // 處理常見錯誤
      switch (error.code) {
        case 'auth/user-not-found':
          setError('找不到此使用者');
          break;
        case 'auth/wrong-password':
          setError('密碼錯誤');
          break;
        case 'auth/invalid-email':
          setError('無效的電子郵件格式');
          break;
        case 'auth/too-many-requests':
          setError('登入嘗試次數過多，請稍後再試');
          break;
        default:
          setError('登入失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 檢查是否為新使用者，如果是則創建使用者文檔
      const userDoc = doc(db, 'users', result.user.uid);
      await updateDoc(userDoc, {
        lastLogin: new Date().toISOString()
      }).catch(async () => {
        // 如果文檔不存在，創建新的
        await setDoc(userDoc, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          role: 'user'
        });
      });

      router.push('/');
    } catch (error: any) {
      console.error('Google 登入錯誤:', error);
      setError('Google 登入失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center">
            <LogIn className="mr-2 h-6 w-6" />
            登入
          </CardTitle>
          <CardDescription>
            使用您的電子郵件登入或選擇其他方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登入中...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  使用電子郵件登入
                </>
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            使用 Google 登入
          </Button>
          
          <div className="mt-4 text-center text-sm">
            還沒有帳號？{' '}
            <a href="/register" className="text-primary hover:underline">
              立即註冊
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}