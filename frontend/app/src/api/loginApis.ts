import axios from "axios";
import { sinupFormType } from "../types/loginType";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

export interface LoginSuccessResponse {
  token: string;
  username: string;
  userId: string;
}

export interface LoginErrorResponse {
  error: string;
}

export const loginCheckApi = async (formdata: {
  email: string;
}): Promise<undefined | { result: string }> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/loginCheck`,
      formdata
    );

    return {
      result: response.data.result,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};

export const loginApi = async (formdata: {
  email: string;
  password: string;
}): Promise<LoginSuccessResponse | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/login`,
      formdata
    );

    return {
      token: response.data.access_token,
      username: response.data.username,
      userId: response.data.user_id,
    };
  } catch (error: unknown) {
    // エラーは呼び出し元で処理するため、undefinedを返す
    return undefined;
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
): Promise<
  | {
      result: boolean;
      message: string;
    }
  | undefined
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/singUp`,
      formdata
    );

    return {
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};
