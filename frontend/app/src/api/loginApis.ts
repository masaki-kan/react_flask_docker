import axios from "axios";
import { sinupFormType } from "../types/loginType";
import { createErrorResponse, ApiResponse } from "../utils/alert/sweetalert2";

export interface LoginSuccessResponse {
  token: string;
  username: string;
  userId: string;
  email: string;
  type: string;
}

export interface LoginErrorResponse {
  error: string;
}

export const loginCheckApi = async (formdata: {
  email: string;
}): Promise<ApiResponse<{ result: string }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/loginCheck`,
      formdata
    );

    return {
      success: true,
      data: {
        result: response.data.result,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "メールアドレスの確認に失敗しました");
  }
};

export const loginApi = async (formdata: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginSuccessResponse>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/login`,
      formdata
    );

    return {
      success: true,
      data: {
        token: response.data.access_token,
        username: response.data.username,
        userId: response.data.user_id,
        email: response.data.email,
        type: response.data.type,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "ログインに失敗しました");
  }
};

export const getLoginErrorMessage = (error: unknown): string => {
  let errorMessage = "ログインできませんでした";

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      errorMessage = "メールアドレスまたはパスワードが正しくありません";
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "接続がタイムアウトしました";
    } else if (!error.response) {
      errorMessage = "サーバーに接続できませんでした";
    }
  }

  return errorMessage;
};

export const singupApi = async (
  formdata: sinupFormType
): Promise<ApiResponse<{ result: boolean; message: string }>> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/singUp`,
      formdata
    );
    return {
      success: true,
      data: {
        result: response.data.result,
        message: response.data.message,
      },
    };
  } catch (error: unknown) {
    return createErrorResponse(error, "ユーザー登録に失敗しました");
  }
};
