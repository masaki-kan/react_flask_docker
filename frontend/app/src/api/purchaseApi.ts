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
  payment_method?: 'card' | 'bank_transfer';
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

export interface BankTransferRequest {
  trade_id: number;
}

export interface BankTransferInfo {
  type: string;
  financial_addresses?: Array<{
    type: string;
    zengin?: {
      bank_name: string;
      bank_code: string;
      branch_name: string;
      branch_code: string;
      account_type: string;
      account_number: string;
      account_holder_name: string;
    };
  }>;
  amount_remaining: number;
  reference?: string;
}

export interface BankTransferResponse {
  trade_id: number;
  payment_intent_id: string;
  status: string;
  amount: number;
  bank_transfer_info?: BankTransferInfo;
  is_test_mode: boolean;
}

export interface BankTransferStatusResponse {
  trade_id: number;
  payment_status: string;
  trade_status: string;
  amount_received: number;
  amount_remaining?: number;
  is_payment_complete: boolean;
  is_test_mode?: boolean;
}

export interface CardPaymentIntentRequest {
  trade_id: number;
}

export interface CardPaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  is_test_mode: boolean;
}

export interface ConfirmCardPaymentRequest {
  trade_id: number;
  payment_intent_id: string;
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

// ================================================================================
// 6. 銀行振込決済API
// ================================================================================

/**
 * 銀行振込用のPaymentIntentを作成
 */
export const createBankTransferPayment = async (
  params: BankTransferRequest
): Promise<ApiResponse<BankTransferResponse>> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create_bank_transfer_payment`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('銀行振込決済エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * 銀行振込の入金状況を確認
 */
export const checkBankTransferStatus = async (
  params: BankTransferRequest
): Promise<ApiResponse<BankTransferStatusResponse>> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/check_bank_transfer_status`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('銀行振込状況確認エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * 【テスト用】銀行振込の入金をシミュレート
 */
export const simulateBankTransferReceived = async (
  params: BankTransferRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/simulate_bank_transfer_received`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('銀行振込シミュレートエラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// ================================================================================
// 7. カード決済API（Stripe Elements用）
// ================================================================================

/**
 * カード決済用のPaymentIntentを作成
 */
export const createCardPaymentIntent = async (
  params: CardPaymentIntentRequest
): Promise<ApiResponse<CardPaymentIntentResponse>> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create_card_payment_intent`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('カード決済準備エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * カード決済の完了を確認
 */
export const confirmCardPayment = async (
  params: ConfirmCardPaymentRequest
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/confirm_card_payment`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('カード決済確認エラー:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};
