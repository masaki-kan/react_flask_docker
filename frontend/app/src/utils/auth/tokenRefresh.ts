import { TokenManager, getTokenTimeRemaining } from "./tokenUtils";

/**
 * トークンリフレッシュ機能
 *
 */

// リフレッシュタイミング設定（秒）
const REFRESH_SETTINGS = {
  // 残り時間がこの値以下になったらリフレッシュを実行
  REFRESH_THRESHOLD: 86400, // 1日 (24時間 * 60分 * 60秒)

  // 参考値:
  // 1時間 = 3600秒
  // 6時間 = 21600秒
  // 12時間 = 43200秒
  // 1日 = 86400秒 (現在の設定)
  // 7日 = 604800秒
} as const;

// リフレッシュAPIレスポンスの型
interface RefreshResponse {
  success: boolean;
  data?: {
    token: string;
    refreshToken?: string;
  };
  message?: string;
}

/**
 * トークンをリフレッシュする
 */
export async function refreshUserToken(): Promise<boolean> {
  try {
    const token = TokenManager.getUserToken();
    if (!token) return false;

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data: RefreshResponse = await response.json();

    if (data.success && data.data?.token) {
      // 新しいトークンを保存
      TokenManager.saveUserToken(data.data.token);
      return true;
    }

    return false;
  } catch {
    // console.error("Token refresh error:", error);
    return false;
  }
}

/**
 * 管理者トークンをリフレッシュする
 */
export async function refreshAdminToken(): Promise<boolean> {
  try {
    const token = TokenManager.getAdminToken();
    if (!token) return false;

    // TODO: バックエンドの管理者リフレッシュAPIエンドポイントを実装
    const response = await fetch("/api/admin/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Admin token refresh failed");
    }

    const data: RefreshResponse = await response.json();

    if (data.success && data.data?.token) {
      // 新しい管理者トークンを保存
      TokenManager.saveAdminToken(data.data.token);
      return true;
    }

    return false;
  } catch {
    // console.error("Admin token refresh error:", error);
    return false;
  }
}

/**
 * 自動リフレッシュが必要かチェック
 * 残り時間が1日以下の場合にリフレッシュを実行
 */
export function shouldRefreshToken(token: string): boolean {
  const timeRemaining = getTokenTimeRemaining(token);
  return timeRemaining <= REFRESH_SETTINGS.REFRESH_THRESHOLD && timeRemaining > 0;
}

/**
 * ユーザートークンの自動リフレッシュ
 */
export async function autoRefreshUserToken(): Promise<boolean> {
  const token = TokenManager.getUserToken();
  if (!token) return false;

  if (shouldRefreshToken(token)) {
    return await refreshUserToken();
  }

  return true; // リフレッシュ不要
}

/**
 * 管理者トークンの自動リフレッシュ
 */
export async function autoRefreshAdminToken(): Promise<boolean> {
  const token = TokenManager.getAdminToken();
  if (!token) return false;

  if (shouldRefreshToken(token)) {
    return await refreshAdminToken();
  }

  return true; // リフレッシュ不要
}
