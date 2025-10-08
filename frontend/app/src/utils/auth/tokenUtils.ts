/**
 * JWT トークンユーティリティ
 * セキュアなトークン管理機能を提供
 */

// JWT payloadの型定義
interface JWTPayload {
  exp?: number;
  iat?: number;
  userId?: string;
  userType?: string;
  [key: string]: any;
}

// トークンストレージのキー（トークンのみ保存）
const TOKEN_KEYS = {
  USER_TOKEN: "token",
  ADMIN_TOKEN: "adminToken",
} as const;

/**
 * Base64URLデコード（JWTペイロード解析用）
 */
function base64UrlDecode(str: string): string {
  // Base64URL → Base64変換

  str = str.replace(/-/g, "+").replace(/_/g, "/");

  // パディング追加
  while (str.length % 4) {
    str += "=";
  }
  try {
    return atob(str);
  } catch {
    throw new Error("Invalid base64 string");
  }
}

/**
 * JWTペイロードを安全にデコード
 */
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      console.warn("Invalid JWT format");
      return null;
    }

    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.warn("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * トークンの有効期限をチェック
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token);

  if (!payload || !payload.exp) {
    // expクレームがない場合は期限切れとみなす
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * トークンの残り時間を取得（秒）
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJWTPayload(token);

  if (!payload || !payload.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - currentTime);
}

/**
 * セキュアなローカルストレージ操作
 */
export class SecureStorage {
  /**
   * データを暗号化して保存（簡易実装）
   */
  static setItem(key: string, value: string): void {
    try {
      // 簡易的な難読化（完全なセキュリティではないが基本的な保護）
      const encoded = btoa(value + "|" + Date.now());
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  /**
   * データを復号化して取得
   */
  static getItem(key: string): string | null {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;

      const decoded = atob(encoded);
      const parts = decoded.split("|");

      if (parts.length !== 2) {
        // 不正な形式の場合は削除
        localStorage.removeItem(key);
        return null;
      }

      return parts[0];
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      // エラーの場合は該当キーを削除
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * データを削除
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * 全認証データをクリア
   */
  static clearAuthData(): void {
    Object.values(TOKEN_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

/**
 * トークン管理クラス
 */
export class TokenManager {
  /**
   * ユーザートークンを保存（トークンのみ）
   */
  static saveUserToken(token: string): void {
    SecureStorage.setItem(TOKEN_KEYS.USER_TOKEN, token);
  }

  /**
   * 管理者トークンを保存（トークンのみ）
   */
  static saveAdminToken(token: string): void {
    SecureStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, token);
  }

  /**
   * ユーザートークンを取得
   */
  static getUserToken(): string | null {
    return SecureStorage.getItem(TOKEN_KEYS.USER_TOKEN);
  }

  /**
   * 管理者トークンを取得
   */
  static getAdminToken(): string | null {
    return SecureStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
  }

  /**
   * ユーザートークンをクリア
   */
  static clearUserToken(): void {
    SecureStorage.removeItem(TOKEN_KEYS.USER_TOKEN);
  }

  /**
   * 管理者トークンをクリア
   */
  static clearAdminToken(): void {
    SecureStorage.removeItem(TOKEN_KEYS.ADMIN_TOKEN);
  }

  /**
   * 全トークンをクリア
   */
  static clearAllTokens(): void {
    this.clearUserToken();
    this.clearAdminToken();
  }

  /**
   * 有効なユーザートークンをチェック
   */
  static isValidUserToken(): boolean {
    const token = this.getUserToken();
    return token ? !isTokenExpired(token) : false;
  }

  /**
   * 有効な管理者トークンをチェック
   */
  static isValidAdminToken(): boolean {
    const token = this.getAdminToken();
    return token ? !isTokenExpired(token) : false;
  }
}
