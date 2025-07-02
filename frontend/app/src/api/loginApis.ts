import axios from "axios";
import { sinupFormType } from "../types/loginType";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const toMail = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/mail`);
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        errorSweetalert2("Error");
        // console.error("mail error:", error.response.data);
      } else {
        errorSweetalert2("Error");
        // レスポンスがない場合はネットワークエラーなど
        // console.error(
        //   "Error: The request was made but no response was received"
        // );
      }
    } else {
      errorSweetalert2("Error");
      // それ以外のエラータイプ
      // console.error("Error:", error);
    }
  }
};

export const loginCheckApi = async (formdata: {
  email: string;
}): Promise<undefined | { result: string }> => {
  console.log("${import.meta.env.VITE_API_URL}", import.meta.env.VITE_API_URL);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/loginCheck`,
      formdata
    );

    return {
      result: response.data.result,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        // console.error("loginCheck error:", error.response.data);
        errorSweetalert2("Error");
      } else {
        // レスポンスがない場合はネットワークエラーなど
        // console.error(
        //   "Error: The request was made but no response was received"
        // );
        errorSweetalert2("Error");
      }
    } else {
      // それ以外のエラータイプ
      // console.error("Error:", error);
      errorSweetalert2("Error");
    }
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
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        // console.error("Login error:", error.response.data);
        errorSweetalert2("Error");
      } else {
        // レスポンスがない場合はネットワークエラーなど
        // console.error(
        //   "Error: The request was made but no response was received"
        // );
        errorSweetalert2("Error");
      }
    } else {
      // それ以外のエラータイプ
      // console.error("Error:", error);
      errorSweetalert2("Error");
    }
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
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        errorSweetalert2("Error");
        // console.error("Login error:", error.response.data);
      } else {
        // レスポンスがない場合はネットワークエラーなど
        errorSweetalert2("Error");
        // console.error(
        //   "Error: The request was made but no response was received"
        // );
      }
    } else {
      // それ以外のエラータイプ
      errorSweetalert2("Error");
      // console.error("Error:", error);
    }
  }
};
