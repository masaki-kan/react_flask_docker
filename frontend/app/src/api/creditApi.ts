import axios from "axios";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

// Stripeレスポンスの型定義
export interface StripePaymentResponse {
  type: "setup" | "payment";
  clientSecret: string;
  stripeCustomerId: string;
  subscriptionId: string;
  plan: "monthly" | "yearly";
  intentId?: string;
  trialEnd?: string;
  nextBillingDate?: string;
  nextBillingAmount?: number;
  amount?: number;
}

// エラーレスポンスの型定義
interface ErrorResponse {
  error: string;
  result: boolean;
  code?: string;
}

// Stripeエラーの型定義
export interface StripeError {
  type: "card_error" | "validation_error" | "api_error";
  message: string;
  code?: string;
}

export const createPaymentIntent = async (
  amount: string,
  status: number
): Promise<StripePaymentResponse | undefined> => {
  try {
    // 入力値の検証
    if (status !== 0 && status !== 1) {
      throw new Error("無効なプランが選択されています");
    }

    const response = await axios.post<StripePaymentResponse>(
      `${import.meta.env.VITE_API_URL}/api/create-payment-intent`,
      {
        amount,
        status,
      },
      {
        timeout: 30000, // 30秒のタイムアウト設定
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // レスポンスの検証
    if (!response.data.clientSecret || !response.data.stripeCustomerId) {
      throw new Error("決済情報の取得に失敗しました");
    }

    return response.data;
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        const errorData = error.response.data as ErrorResponse;
        errorMessage = errorData.error;

        // エラーコードに応じた詳細なメッセージ
        switch (error.response.status) {
          case 400:
            errorMessage = "入力内容に誤りがあります。もう一度お試しください。";
            break;
          case 401:
            errorMessage =
              "認証エラーが発生しました。再度ログインしてください。";
            break;
          case 429:
            errorMessage =
              "サーバーが混雑しています。しばらくしてからお試しください。";
            break;
          case 500:
            errorMessage =
              "サーバーエラーが発生しました。時間をおいてお試しください。";
            break;
          default:
            errorMessage = errorData.error || errorMessage;
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "接続がタイムアウトしました。ネットワーク接続を確認してください。";
      } else if (!error.response) {
        errorMessage =
          "ネットワークエラーが発生しました。接続を確認してください。";
      }
    }

    // エラーアラートを表示
    errorSweetalert2(errorMessage);

    // エラーログを記録（本番環境では適切なロギングサービスに送信）
    console.error("Payment intent creation error:", {
      message: errorMessage,
      error: error,
      timestamp: new Date().toISOString(),
    });

    return undefined;
  }
};

// サブスクリプション情報取得
export const getSubscriptionInfo = async (userID: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/subscription-info`,
      { user_id: userID }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get subscription info:", error);
    return null;
  }
};

// サブスクリプションキャンセル
export const cancelSubscription = async (userID: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/cancel-subscription`,
      { user_id: userID }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorSweetalert2(error.response.data.error);
    } else {
      errorSweetalert2("サブスクリプションのキャンセルに失敗しました");
    }
    return null;
  }
};

export const withdrawalApi = async (
  userID: string
): Promise<{
  result: boolean;
  message?: string;
} | null> => {
  console.log("userID", userID);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/withdraw`,
      { user_id: userID },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorSweetalert2(error.response.data.error);
    } else {
      errorSweetalert2("退会処理に失敗しました");
    }
    return null;
  }
};
