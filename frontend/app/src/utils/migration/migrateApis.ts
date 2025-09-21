/**
 * API移行用ユーティリティ
 * 既存のAPI関数をApiResponse型に統一するためのヘルパー関数
 */

import { ApiResponse, createErrorResponse } from '../alert/sweetalert2';

/**
 * 既存のAPIレスポンスをApiResponse型にラップする
 */
export function wrapApiResponse<T>(
  apiCall: () => Promise<T>,
  errorMessage: string = "処理に失敗しました"
): Promise<ApiResponse<T>> {
  return apiCall()
    .then((data) => ({
      success: true as const,
      data,
    }))
    .catch((error) => createErrorResponse(error, errorMessage));
}

/**
 * 移行済みAPIの型定義例
 */
export interface MigratedApiFunction<T, P extends any[] = []> {
  (...params: P): Promise<ApiResponse<T>>;
}

/**
 * 移行ガイドライン
 */
export const MIGRATION_GUIDELINES = {
  // 1. インポートを統一
  imports: `
import { ApiResponse, createErrorResponse } from "../utils/alert/sweetalert2";
  `,
  
  // 2. 戻り値の型を統一
  returnType: `
Promise<ApiResponse<YourDataType>>
  `,
  
  // 3. 成功時のレスポンス形式
  successResponse: `
return {
  success: true,
  data: yourData,
};
  `,
  
  // 4. エラーハンドリング
  errorHandling: `
catch (error: unknown) {
  return createErrorResponse(error, "適切なエラーメッセージ");
}
  `,
  
  // 5. フックでの使用例
  hookUsage: `
const { data, isLoading, error } = useSomeHook();
if (data?.success) {
  // data.data でアクセス
  console.log(data.data);
}
  `,
} as const;