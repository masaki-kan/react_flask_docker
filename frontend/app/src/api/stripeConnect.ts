/**
 * Stripe Connect API
 * 販売者登録とStripe Connected Account管理
 */

import axios from "axios";
import { TokenManager } from "../utils/auth/tokenUtils";

const API_URL = import.meta.env.VITE_API_URL;

export interface CreateConnectAccountResponse {
  success: boolean;
  message?: string;
  data?: {
    account_id: string;
    onboarding_url?: string;
    onboarding_completed?: boolean;
    is_existing?: boolean;
    is_test_mode?: boolean;
  };
}

export interface CheckAccountStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    account_id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    onboarding_completed: boolean;
    is_test_mode?: boolean;
  };
}

export interface GetDashboardLinkResponse {
  success: boolean;
  message?: string;
  data?: {
    dashboard_url: string;
  };
}

export interface GetSellerBalanceResponse {
  success: boolean;
  message?: string;
  data?: {
    available: number;
    pending: number;
    currency: string;
    payout_fee: number;
    is_test_mode?: boolean;
  };
}

export interface RequestPayoutResponse {
  success: boolean;
  message?: string;
  data?: {
    payout_id: string;
    amount: number;
    fee: number;
    currency: string;
    status: string;
    is_test_mode?: boolean;
  };
}

/**
 * 販売者のConnected Accountを作成してオンボーディングURLを取得
 */
export const createConnectAccount = async (
  userId: number
): Promise<CreateConnectAccountResponse> => {
  const token = TokenManager.getUserToken();

  if (!token) {
    return {
      success: false,
      message: "認証トークンが見つかりません",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/create_connect_account`,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: "エラーが発生しました",
    };
  }
};

/**
 * Stripeアカウントの状態を確認
 */
export const checkAccountStatus = async (
  userId: number
): Promise<CheckAccountStatusResponse> => {
  const token = TokenManager.getUserToken();

  if (!token) {
    return {
      success: false,
      message: "認証トークンが見つかりません",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/check_stripe_account_status`,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: "エラーが発生しました",
    };
  }
};

/**
 * Stripeダッシュボードへのリンクを取得（本番環境のみ）
 */
export const getDashboardLink = async (
  userId: number
): Promise<GetDashboardLinkResponse> => {
  const token = TokenManager.getUserToken();

  if (!token) {
    return {
      success: false,
      message: "認証トークンが見つかりません",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/get_stripe_dashboard_link`,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: "エラーが発生しました",
    };
  }
};

/**
 * 販売者の残高を取得
 */
export const getSellerBalance = async (
  userId: number
): Promise<GetSellerBalanceResponse> => {
  const token = TokenManager.getUserToken();

  if (!token) {
    return {
      success: false,
      message: "認証トークンが見つかりません",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/get_seller_balance`,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: "エラーが発生しました",
    };
  }
};

/**
 * 振込申請を送信
 */
export const requestPayout = async (
  userId: number
): Promise<RequestPayoutResponse> => {
  const token = TokenManager.getUserToken();

  if (!token) {
    return {
      success: false,
      message: "認証トークンが見つかりません",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/request_payout`,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: "エラーが発生しました",
    };
  }
};
