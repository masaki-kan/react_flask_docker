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

// トークンストレージのキー
const TOKEN_KEYS = {
  USER_TOKEN: 'token',
  USER_USERNAME: 'username', 
  USER_ID: 'userId',
  ADMIN_TOKEN: 'adminToken',
  ADMIN_USERNAME: 'adminUsername',
  ADMIN_ID: 'adminUserId',
  USER_TYPE: 'userType',
} as const;

/**
 * Base64URLデコード（JWTペイロード解析用）
 */
function base64UrlDecode(str: string): string {
  // Base64URL → Base64変換
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // パディング追加
  while (str.length % 4) {
    str += '=';
  }
  
  try {
    return atob(str);
  } catch (error) {
    throw new Error('Invalid base64 string');
  }
}

/**
 * JWTペイロードを安全にデコード
 */
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format');
      return null;
    }

    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.warn('Failed to decode JWT:', error);
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
      const encoded = btoa(value + '|' + Date.now());
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
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
      const parts = decoded.split('|');
      
      if (parts.length !== 2) {
        // 不正な形式の場合は削除
        localStorage.removeItem(key);
        return null;
      }

      return parts[0];
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
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
    Object.values(TOKEN_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

/**
 * トークン管理クラス
 */
export class TokenManager {
  /**
   * ユーザートークンを保存
   */
  static saveUserTokens(username: string, token: string, userId: string, userType: string): void {
    SecureStorage.setItem(TOKEN_KEYS.USER_TOKEN, token);
    SecureStorage.setItem(TOKEN_KEYS.USER_USERNAME, username);
    SecureStorage.setItem(TOKEN_KEYS.USER_ID, userId);
    SecureStorage.setItem(TOKEN_KEYS.USER_TYPE, userType);
  }

  /**
   * 管理者トークンを保存
   */
  static saveAdminTokens(username: string, token: string, userId: string, userType: string): void {
    SecureStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, token);
    SecureStorage.setItem(TOKEN_KEYS.ADMIN_USERNAME, username);
    SecureStorage.setItem(TOKEN_KEYS.ADMIN_ID, userId);
    SecureStorage.setItem(TOKEN_KEYS.USER_TYPE, userType);
  }

  /**
   * ユーザートークンを取得
   */
  static getUserTokens(): { token: string | null; username: string | null; userId: string | null } {
    return {
      token: SecureStorage.getItem(TOKEN_KEYS.USER_TOKEN),
      username: SecureStorage.getItem(TOKEN_KEYS.USER_USERNAME),
      userId: SecureStorage.getItem(TOKEN_KEYS.USER_ID),
    };
  }

  /**
   * 管理者トークンを取得
   */
  static getAdminTokens(): { token: string | null; username: string | null; userId: string | null } {
    return {
      token: SecureStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN),
      username: SecureStorage.getItem(TOKEN_KEYS.ADMIN_USERNAME),
      userId: SecureStorage.getItem(TOKEN_KEYS.ADMIN_ID),
    };
  }

  /**
   * ユーザートークンをクリア
   */
  static clearUserTokens(): void {
    SecureStorage.removeItem(TOKEN_KEYS.USER_TOKEN);
    SecureStorage.removeItem(TOKEN_KEYS.USER_USERNAME);
    SecureStorage.removeItem(TOKEN_KEYS.USER_ID);
  }

  /**
   * 管理者トークンをクリア
   */
  static clearAdminTokens(): void {
    SecureStorage.removeItem(TOKEN_KEYS.ADMIN_TOKEN);
    SecureStorage.removeItem(TOKEN_KEYS.ADMIN_USERNAME);
    SecureStorage.removeItem(TOKEN_KEYS.ADMIN_ID);
    SecureStorage.removeItem(TOKEN_KEYS.USER_TYPE);
  }

  /**
   * 有効なユーザートークンをチェック
   */
  static isValidUserToken(): boolean {
    const { token } = this.getUserTokens();
    return token ? !isTokenExpired(token) : false;
  }

  /**
   * 有効な管理者トークンをチェック
   */
  static isValidAdminToken(): boolean {
    const { token } = this.getAdminTokens();
    return token ? !isTokenExpired(token) : false;
  }
}