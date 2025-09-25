import axios from "axios";
import { apiRetuenProfileType, profileType } from "../types/profileType";
import { ApiResponse, createErrorResponse } from "../utils/alert/sweetalert2";
import {
  archiveDetailResponse,
  exchangeArchive,
} from "./../types/archiveTradeType";

// プロフ取得
export const getProfileApi = async (
  id: number,
  myId?: number
): Promise<ApiResponse<apiRetuenProfileType>> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/getProfile`,
      {
        params: {
          id: id,
          my_id: myId ?? undefined,
        },
      }
    );

    const profile = {
      id: String(id),
      image: response.data.profile.image,
      name: response.data.profile.name,
      location: response.data.profile.location,
      old: response.data.profile.old,
      age: response.data.profile.age,
      tag: response.data.profile.tags,
      favoriteShop: {
        name: response.data.profile.shop_name,
        url: response.data.profile.shop_url,
      },
      reasen: response.data.profile.reasen,
      is_following: response.data.profile.is_following,
      likes: response.data.profile.likes,
      plan: response.data.profile.plan,
      tradeStatusFlag: response.data.profile.trade_status_flag,
      type: response.data.profile.type,
      is_deleted: response.data.profile.is_deleted,
      deleted_at: response.data.profile.deleted_at,
      email: response.data.profile.email,
    };

    // 空なので
    const items = response.data.items;

    return {
      success: true,
      data: {
        profile,
        items,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "プロフィール取得に失敗しました");
  }
};

export const getProfileItemsApi = async (
  id: number
): Promise<
  ApiResponse<{
    items: {
      itemId: string;
      title: string;
      description: string;
      images: { image_url: string }[];
      brand: { key: string; name: string };
      type: string;
      uploaded_at: Date;
      tradeStatusFlag: number;
    }[];
  }>
> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/getProfileItems`,
      {
        params: {
          id,
        },
      }
    );

    const items = response.data.items.map(
      (items: {
        item_id: string;
        title: string;
        description: string;
        images: { image_url: string }[];
        brand: { key: string; name: string };
        type: string;
        uploaded_at: Date;
        trade_status_flag: number;
      }) => {
        return {
          itemId: items.item_id,
          title: items.title,
          description: items.description,
          images: items.images,
          type: items.type,
          brand: items.brand,
          uploaded_at: items.uploaded_at,
          tradeStatusFlag: items.trade_status_flag,
        };
      }
    );

    return {
      success: true,
      data: {
        items,
      },
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 自分のプロフ更新
export const postStoreProfileApi = async (
  formData: profileType
): Promise<ApiResponse<{ message: string; status: boolean }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/postStoreProfile`,
      {
        userData: formData,
      }
    );

    return {
      success: true,
      data: {
        message: response.data.message,
        status: response.data.result,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "プロフィール更新に失敗しました");
  }
};

// 自分のプロフ 商品登録
export const postStoreProfileItemApi = async (
  formData: FormData
): Promise<ApiResponse<{ message: string; status: boolean }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/postStoreProfileItem`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: {
        message: response.data.message,
        status: response.data.result,
      },
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 退会処理
export const cancellationProcessApi = async (userID: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/cancellationProcess`,
      { userID: userID }
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// 自分のプロフ 商品削除
export const deleteUserItemApi = async (
  item_id: string,
  my_user_id: number
): Promise<ApiResponse<{ message: string; status: boolean }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/deleteUserItem`,
      {
        item_id,
        my_user_id: my_user_id,
      }
    );

    return {
      success: true,
      data: {
        status: response.data.result,
        message: response.data.message,
      },
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// アーカイブ詳細を取得
export const fetchArchiveDetailApi = async (
  archiveTradeId: string
): Promise<ApiResponse<archiveDetailResponse>> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/getArchiveDetail?archive_trade_id=${archiveTradeId}`
    );

    if (response.data.result) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return createErrorResponse(
        new Error("Archive detail not found"),
        "アーカイブの詳細が見つかりませんでした"
      );
    }
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// 交換履歴
export const exchangeArchiveApi = async (
  user_id: number
): Promise<
  ApiResponse<{
    status: boolean;
    archives: exchangeArchive[];
    total: number;
  }>
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getexchangeArchive`,
      {
        user_id,
      }
    );

    return {
      success: true,
      data: {
        status: response.data.result,
        archives: response.data.archives,
        total: response.data.total,
      },
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};
