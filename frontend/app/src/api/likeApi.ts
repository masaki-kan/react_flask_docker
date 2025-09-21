import axios from "axios";
import { ApiResponse, createErrorResponse } from "../utils/alert/sweetalert2";

export interface LikeApiResponse {
  result: boolean;
  liked: boolean;
  message: string;
}

export const itemLikeApi = async (
  item_id: string,
  my_user_id: string
): Promise<ApiResponse<LikeApiResponse>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/itemLike`,
      {
        item_id: item_id,
        my_user_id: my_user_id,
      }
    );

    return {
      success: true,
      data: {
        result: response.data.result,
        liked: response.data.liked,
        message: response.data.message,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "いいね処理に失敗しました");
  }
};
