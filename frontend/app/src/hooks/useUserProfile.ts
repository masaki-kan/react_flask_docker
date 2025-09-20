import { useState, useCallback } from "react";
import { TokenManager } from "../utils/auth/tokenUtils";

// ユーザープロフィールの型定義
export interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  type: string;
  plan?: string;
  profile_image?: string;
  created_at?: string;
}

/**
 * ユーザープロフィール管理フック
 * localStorageではなくAPIから都度取得
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロフィール取得関数
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    const token = TokenManager.getUserToken();
    if (!token) {
      setError("認証が必要です");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: プロフィール取得失敗`);
      }

      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return data.profile;
      } else {
        throw new Error(data.message || "プロフィール取得に失敗しました");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(errorMessage);
      console.error("Profile fetch error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 管理者プロフィール取得関数
  const fetchAdminProfile =
    useCallback(async (): Promise<UserProfile | null> => {
      const token = TokenManager.getAdminToken();
      if (!token) {
        setError("管理者認証が必要です");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: 管理者プロフィール取得失敗`
          );
        }

        const data = await response.json();

        if (data.success && data.profile) {
          setProfile(data.profile);
          return data.profile;
        } else {
          throw new Error(
            data.message || "管理者プロフィール取得に失敗しました"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "不明なエラー";
        setError(errorMessage);
        console.error("Admin profile fetch error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  // プロフィールリセット
  const resetProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  // 自動プロフィール取得（トークンベース）
  const autoFetchProfile = useCallback(async () => {
    // 管理者トークンを優先チェック
    if (TokenManager.isValidAdminToken()) {
      return await fetchAdminProfile();
    }
    // 通常ユーザートークンをチェック
    else if (TokenManager.isValidUserToken()) {
      return await fetchProfile();
    }
    // どちらもない場合
    else {
      resetProfile();
      return null;
    }
  }, [fetchProfile, fetchAdminProfile, resetProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    fetchAdminProfile,
    autoFetchProfile,
    resetProfile,
  };
};
