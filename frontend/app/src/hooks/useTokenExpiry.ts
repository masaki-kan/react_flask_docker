import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../provider/authContext';
import { TokenManager, getTokenTimeRemaining } from '../utils/auth/tokenUtils';
import { useToast } from '@chakra-ui/react';

/**
 * トークン期限切れ監視フック
 */
export const useTokenExpiry = () => {
  const { isLoggedIn, isAdminLoggedIn, logout, adminLogout } = useAuth();
  const toast = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  // 期限切れ警告を表示
  const showExpiryWarning = useCallback((timeRemaining: number) => {
    if (warningShownRef.current) return;
    
    warningShownRef.current = true;
    const minutes = Math.ceil(timeRemaining / 60);
    
    toast({
      title: "セッション期限警告",
      description: `あと${minutes}分でログアウトされます`,
      status: "warning",
      duration: 10000,
      isClosable: true,
      position: "top",
    });
  }, [toast]);

  // 自動ログアウト実行
  const performAutoLogout = useCallback((userType: 'user' | 'admin') => {
    toast({
      title: "セッション期限切れ",
      description: "自動的にログアウトしました",
      status: "info",
      duration: 5000,
      isClosable: true,
      position: "top",
    });

    if (userType === 'admin') {
      adminLogout();
    } else {
      logout();
    }
  }, [toast, logout, adminLogout]);

  // トークン期限をチェック
  const checkTokenExpiry = useCallback(() => {
    // ユーザートークンチェック
    if (isLoggedIn) {
      if (!TokenManager.isValidUserToken()) {
        performAutoLogout('user');
        return;
      }

      const { token } = TokenManager.getUserTokens();
      if (token) {
        const timeRemaining = getTokenTimeRemaining(token);
        
        // 5分前に警告表示
        if (timeRemaining <= 300 && timeRemaining > 0) {
          showExpiryWarning(timeRemaining);
        }
      }
    }

    // 管理者トークンチェック
    if (isAdminLoggedIn) {
      if (!TokenManager.isValidAdminToken()) {
        performAutoLogout('admin');
        return;
      }

      const { token } = TokenManager.getAdminTokens();
      if (token) {
        const timeRemaining = getTokenTimeRemaining(token);
        
        // 5分前に警告表示
        if (timeRemaining <= 300 && timeRemaining > 0) {
          showExpiryWarning(timeRemaining);
        }
      }
    }
  }, [isLoggedIn, isAdminLoggedIn, performAutoLogout, showExpiryWarning]);

  // ログイン状態が変わった時の処理
  useEffect(() => {
    // 警告フラグをリセット
    warningShownRef.current = false;

    if (isLoggedIn || isAdminLoggedIn) {
      // 即座にチェック実行
      checkTokenExpiry();
      
      // 1分ごとにチェック
      intervalRef.current = setInterval(checkTokenExpiry, 60000);
    } else {
      // ログアウト時はタイマークリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoggedIn, isAdminLoggedIn, checkTokenExpiry]);

  // ページフォーカス時の追加チェック
  useEffect(() => {
    const handleFocus = () => {
      if (isLoggedIn || isAdminLoggedIn) {
        checkTokenExpiry();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoggedIn, isAdminLoggedIn, checkTokenExpiry]);

  // 手動でトークン有効性をチェックする関数を返す
  return {
    checkTokenExpiry,
    isUserTokenValid: TokenManager.isValidUserToken,
    isAdminTokenValid: TokenManager.isValidAdminToken,
  };
};