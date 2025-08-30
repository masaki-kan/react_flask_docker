import axios from "axios";
import { createErrorResponse, ApiResponse } from "../utils/alert/sweetalert2";

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created: number;
}

export interface PaymentMethodsResponse {
  payment_methods: PaymentMethod[];
  default_payment_method: string | null;
}

// 支払い方法一覧を取得
export const getPaymentMethods = async (
  userId: string
): Promise<ApiResponse<PaymentMethodsResponse>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/payment-methods`,
      { user_id: userId }
    );
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return createErrorResponse(error, "支払い方法の取得に失敗しました");
  }
};

// SetupIntentを作成（新しいカード追加用）
export const createSetupIntent = async (
  userId: string
): Promise<ApiResponse<{
  clientSecret: string;
  setupIntentId: string;
}>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/create-setup-intent`,
      { user_id: userId }
    );
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return createErrorResponse(error, "カード登録の準備に失敗しました");
  }
};

// デフォルトの支払い方法を更新
export const updateDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<ApiResponse<{ result: boolean }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/set-default-payment-method`,
      { user_id: userId, payment_method_id: paymentMethodId }
    );
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return createErrorResponse(error, "デフォルト支払い方法の更新に失敗しました");
  }
};

// 支払い方法を削除
export const deletePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<ApiResponse<{ result: boolean }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/delete-payment-method`,
      { user_id: userId, payment_method_id: paymentMethodId }
    );
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return createErrorResponse(error, "支払い方法の削除に失敗しました");
  }
};

// APIコール用の関数;
export const checkReactivationStatusApi = async (userId: number) => {
  const response = await axios.post("/api/check-reactivation-status", {
    user_id: userId,
  });

  return response;
};

export const reactivateAccountApi = async (
  user_id: string,
  payment_method_id: string | null | PaymentMethod,
  plan_type: number
) => {
  const response = await axios.post("/api/reactivate-account", {
    user_id: user_id,
    payment_method_id: payment_method_id,
    plan_type: plan_type,
  });
  return response;
};
