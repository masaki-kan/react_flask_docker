import axios from "axios";
import { createErrorResponse, ApiResponse } from "../utils/alert/sweetalert2";

export const userFollewApi = async (
  user_id: string,
  my_user_id: string
): Promise<ApiResponse<{ result: boolean; action: string }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/userFollow`,
      {
        follew_user_id: user_id,
        my_user_id,
      }
    );

    return {
      success: true,
      data: {
        result: response.data.result,
        action: response.data.action,
      }
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "フォロー操作に失敗しました");
  }
};
