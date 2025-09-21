import axios from "axios";
import { followListType, tagType } from "../types/listType";
import { createErrorResponse, ApiError } from "../utils/alert/sweetalert2";

export const getUsersApi = async (
  myId: string
): Promise<
  | {
      users: followListType[];
      tags: tagType[];
    }
  | ApiError
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getUsers`,
      {
        user_id: myId,
      }
    );

    return {
      users: response.data.users,
      tags: response.data.tags,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};

// ユーザーの商品情報取得
export const getUserItemApi = async (
  myId: string
): Promise<
  | {
      users: followListType[];
      tags: tagType[];
    }
  | ApiError
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getUsers`,
      {
        user_id: myId,
      }
    );

    return {
      users: response.data.users,
      tags: response.data.tags,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    return createErrorResponse(error, errorMessage);
  }
};
