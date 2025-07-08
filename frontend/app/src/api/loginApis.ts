import axios from "axios";
import { sinupFormType } from "../types/loginType";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

export const loginCheckApi = async (formdata: {
  email: string;
}): Promise<undefined | { result: string }> => {
  console.log(
    "import.meta.env.VITE_API_URL :",
    `${import.meta.env.VITE_API_URL}/api/loginCheck`
  );
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
}): Promise<
  | {
      token: string;
      username: string;
      userId: string;
    }
  | undefined
> => {
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
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
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
