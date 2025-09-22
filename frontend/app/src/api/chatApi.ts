import axios from "axios";
import { chatItemDataType, userDataType } from "../types/chatType";
import { ApiResponse, createErrorResponse } from "../utils/alert/sweetalert2";

export const getChatItemDetailApi = async (
  trade_id: string
): Promise<
  { result: boolean; item?: chatItemDataType; user: userDataType } | undefined
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getChatItemDetail`,
      {
        trade_id,
      }
    );

    return {
      result: response.data.result,
      item: response.data.item,
      user: response.data.user,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    createErrorResponse(error, errorMessage);
  }
};

export const uploadImageApi = async (
  fileData: File
): Promise<{ imageUrl: string } | undefined> => {
  try {
    const formData = new FormData();
    formData.append("image", fileData);
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/upload_image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      imageUrl: response.data.image_url,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        // console.error("Login error:", error.response.data);
        createErrorResponse(error, "Error");
      } else {
        // レスポンスがない場合はネットワークエラーなど
        // console.error(
        //   "Error: The request was made but no response was received"
        // );
        createErrorResponse(error, "Error");
      }
    } else {
      // それ以外のエラータイプ
      createErrorResponse(error, "Error");
    }
  }
};

export const getMessagesApi = async (
  tradeIdNumver: string
): Promise<
  | {
      messages: {
        sender_id: string;
        message: string;
        sent_at: Date;
        sender_image_url: string;
      }[];
      result: boolean;
    }
  | undefined
> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/get_trade_messages?trade_id=${tradeIdNumver}`
    );
    return {
      result: response.data.result,
      messages: response.data.messages,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    createErrorResponse(error, errorMessage);
  }
};

// 発送情報を保存
export const saveShippingInfoApi = async (
  tradeId: string,
  senderUserId: string,
  trackingNumber: string,
  shippingCompany: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/save_shipping_info`,
      {
        trade_id: tradeId,
        sender_user_id: senderUserId,
        tracking_number: trackingNumber,
        shipping_company: shippingCompany,
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "発送情報の保存に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "発送情報の保存に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 発送情報を取得（更新版）
export const fetchShippingInfoApi = async (tradeId: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/get_shipping_info`,
      {
        params: { trade_id: tradeId },
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "発送情報の取得に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "発送情報の取得に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 商品受取確認（簡略化）
export const confirmItemReceivedApi = async (
  tradeId: string,
  userId: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/confirm_item_received`,
      {
        trade_id: tradeId,
        user_id: userId,
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "確認情報の保存に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "確認情報の保存に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 確認状況を取得
export const fetchConfirmationsApi = async (tradeId: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/get_confirmations`,
      {
        params: { trade_id: tradeId },
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "確認情報の取得に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "確認情報の取得に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 相手の商品一覧を取得
export interface PartnerItemsResponse {
  partner_items: chatItemDataType[];
  partner_user: userDataType;
}

export const fetchPartnerItemsApi = async (
  tradeId: string
): Promise<ApiResponse<PartnerItemsResponse>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/get_partner_items`,
      {
        trade_id: tradeId,
      }
    );

    if (response.data.result) {
      return {
        success: true,
        data: {
          partner_items: response.data.partner_items,
          partner_user: response.data.partner_user,
        },
      };
    }
    throw new Error(response.data.error || "相手商品の取得に失敗しました");
  } catch (error: unknown) {
    return createErrorResponse(error, "相手商品の取得に失敗しました");
  }
};

// 交換商品選択API
export interface SelectExchangeResponse {
  result: boolean;
  message?: string;
}

export const selectExchangeItemApi = async (
  tradeId: string,
  selectedItemId: string,
  userId: string
): Promise<ApiResponse<SelectExchangeResponse>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/select_exchange_item`,
      {
        trade_id: tradeId,
        selected_item_id: selectedItemId,
        user_id: userId,
      }
    );

    if (response.data.result) {
      return {
        success: true,
        data: response.data,
      };
    }
    throw new Error(response.data.error || "商品選択に失敗しました");
  } catch (error: unknown) {
    return createErrorResponse(error, "商品選択に失敗しました");
  }
};

// 発送情報保存（交換商品選択も含む）
export const saveShippingInfoWithItemApi = async (
  tradeId: string,
  senderUserId: string,
  trackingNumber: string,
  shippingCompany: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/save_shipping_info_with_item`,
      {
        trade_id: tradeId,
        sender_user_id: senderUserId,
        tracking_number: trackingNumber,
        shipping_company: shippingCompany,
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "発送情報の保存に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "発送情報の保存に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 交換商品情報を取得
export const fetchExchangeItemsApi = async (tradeId: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/get_exchange_items`,
      {
        params: { trade_id: tradeId },
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "交換商品情報の取得に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "交換商品情報の取得に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 交換完了API
export const completeExchangeApi = async (tradeId: string, userId: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/complete_exchange`,
      {
        trade_id: tradeId,
        user_id: userId, // 実行者のuser_idを送信
      }
    );

    if (response.data.result) {
      return response.data;
    }
    throw new Error(response.data.error || "交換完了処理に失敗しました");
  } catch (error: unknown) {
    let errorMessage = "交換完了処理に失敗しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    return createErrorResponse(error, errorMessage);
  }
};
