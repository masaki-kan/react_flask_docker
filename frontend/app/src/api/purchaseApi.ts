/**
 * 購入フロー用のAPIクライアント
 */

import axios from 'axios';

const API_BASE_URL = '/api';

// ================================================================================
// 型定義
// ================================================================================

export interface ProposePriceRequest {
  trade_id: number;
  price: number;
  message?: string;
}

export interface AgreePriceRequest {
  trade_id: number;
  user_type: 'seller' | 'buyer';
}

export interface PayForPurchaseRequest {
  trade_id: number;
  payment_method_id?: string;
}

export interface ConfirmReceivedRequest {
  trade_id: number;
}

export interface CompletePurchaseRequest {
  trade_id: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// ================================================================================
// 1. 金額提案API
// ================================================================================

/**
 * 購入金額を提案
 */
export const proposePurchasePrice = async (
  params: ProposePriceRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/propose_purchase_price`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('金額提案エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// ================================================================================
// 2. 金額合意API
// ================================================================================

/**
 * 金額に合意する
 */
export const agreePurchasePrice = async (
  params: AgreePriceRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/agree_purchase_price`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('金額合意エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// ================================================================================
// 3. 決済API
// ================================================================================

/**
 * 購入代金を決済
 */
export const payForPurchase = async (
  params: PayForPurchaseRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/pay_for_purchase`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('決済エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// ================================================================================
// 4. 受け取り確認API
// ================================================================================

/**
 * 購入者が商品受け取りを確認
 */
export const confirmBuyerReceived = async (
  params: ConfirmReceivedRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/confirm_buyer_received`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('受け取り確認エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// ================================================================================
// 5. 取引完了API
// ================================================================================

/**
 * 発送者（Seller）が取引を完了
 */
export const completePurchaseTrade = async (
  params: CompletePurchaseRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/complete_purchase_trade`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('取引完了エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};
