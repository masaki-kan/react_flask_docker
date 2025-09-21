import axios from "axios";
import { ApiResponse, createErrorResponse } from "../utils/alert/sweetalert2";

export interface UserItemsResponse {
  items: {
    seller_name: string;
    item_id: string;
    title: string;
    description: string;
    type: string;
    brand: { key: string; name: string }[];
    images: string[];
    uploaded_at: Date;
    profile_image: string;
    user_id: number;
    trade_status_flag: number;
  }[];
  brands: { key: string; name: string }[];
  total: number;
  page: number;
  has_more: boolean;
}

export const getUserItemsApi = async (
  myId: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<UserItemsResponse>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getUserItems`,
      {
        user_id: myId,
        page,
        limit,
      }
    );

    return {
      success: true,
      data: {
        items: response.data.items,
        brands: response.data.brands,
        total: response.data.total,
        page: response.data.page,
        has_more: response.data.has_more,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "アイテム取得に失敗しました");
  }
};
