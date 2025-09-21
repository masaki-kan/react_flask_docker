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

// エラーレスポンスを生成する関数（トースト自動表示付き）
export const createErrorResponse = (
  error: unknown,
  defaultMessage: string = "予期しないエラーが発生しました",
  autoShowToast: boolean = true
): ApiError => {
  let statusCode: number | undefined;
  let errorMessage: string;

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
    statusCode = axiosError.response?.status;
    errorMessage = axiosError.response?.data?.error || defaultMessage;
  } else {
    errorMessage = defaultMessage;
  }

  // トーストを自動表示（オプション）
  if (autoShowToast) {
    import('../toast/toastManager').then(({ showErrorToast }) => {
      showErrorToast(errorMessage, statusCode);
    });
  }
  
  return {
    success: false,
    error: errorMessage,
    statusCode,
    shouldRetry: statusCode ? statusCode >= 500 || statusCode === 408 : false // サーバーエラーまたはタイムアウト
  };
};

// トーストを表示しない版のエラーレスポンス生成
export const createSilentErrorResponse = (
  error: unknown,
  defaultMessage: string = "予期しないエラーが発生しました"
): ApiError => {
  return createErrorResponse(error, defaultMessage, false);
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
