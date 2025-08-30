import Swal from "sweetalert2";
import { route } from "../../route/routeConst";

export const errorSweetalert2 = (errorTitle: string) => {
  Swal.fire({
    title: "",
    text: errorTitle,
    icon: "error",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = route.profile;
    }
  });
};

// 新しいエラーハンドリング: Toast通知用のエラー情報を返す
export interface ApiError {
  success: false;
  error: string;
  statusCode?: number;
  shouldRetry?: boolean;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// エラーレスポンスを生成する関数
export const createErrorResponse = (
  error: unknown,
  defaultMessage: string = "予期しないエラーが発生しました"
): ApiError => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
    const statusCode = axiosError.response?.status;
    const errorMessage = axiosError.response?.data?.error || defaultMessage;
    
    return {
      success: false,
      error: errorMessage,
      statusCode,
      shouldRetry: statusCode ? statusCode >= 500 || statusCode === 408 : false // サーバーエラーまたはタイムアウト
    };
  }
  
  return {
    success: false,
    error: defaultMessage,
    shouldRetry: false
  };
};

// システムエラーでログアウトする場合のアラート
export const systemErrorLogoutAlert = () => {
  Swal.fire({
    title: "システムエラー",
    text: "プロフィール情報の取得に失敗したため、ログアウトします。",
    icon: "error",
    confirmButtonText: "OK",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};
