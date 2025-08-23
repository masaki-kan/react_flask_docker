import axios from "axios";

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
): Promise<PaymentMethodsResponse> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/payment-methods`,
      { user_id: userId }
    );
    // console.log("getPaymentMethods response.data;", response.data);
    return response.data;
  } catch (error) {
    // console.error("Error fetching payment methods:", error);
    return {
      payment_methods: [],
      default_payment_method: null,
    };
  }
};

// SetupIntentを作成（新しいカード追加用）
export const createSetupIntent = async (
  userId: string
): Promise<{
  clientSecret: string;
  setupIntentId: string;
} | null> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/create-setup-intent`,
      { user_id: userId }
    );
    return response.data;
  } catch (error) {
    // console.error("Error creating setup intent:", error);
    return null;
  }
};

// デフォルトの支払い方法を更新
export const updateDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/set-default-payment-method`,
      { user_id: userId, payment_method_id: paymentMethodId }
    );
    return response.data.result;
  } catch (error) {
    // console.error("Error updating default payment method:", error);
    return false;
  }
};

// 支払い方法を削除
export const deletePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/delete-payment-method`,
      { user_id: userId, payment_method_id: paymentMethodId }
    );
    return { success: response.data.result };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      return { success: false, error: error.response.data.error };
    }
    return { success: false, error: "削除に失敗しました" };
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
