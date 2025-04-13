import axios from "axios";
import { sinupFormType } from "../src/types/loginType";

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
    const response = await axios.post("http://localhost:5001/login", formdata);
    console.log("Logged in successfully");

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
        console.error("Login error:", error.response.data);
      } else {
        // レスポンスがない場合はネットワークエラーなど
        console.error(
          "Error: The request was made but no response was received"
        );
      }
    } else {
      // それ以外のエラータイプ
      console.error("Error:", error);
    }
  }
};

export const singupApi = async (formdata: sinupFormType) => {
  try {
    const response = await axios.post("http://localhost:5001/singUp", formdata);
    console.log("Access :", response.data);
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("Login error:", error.response.data);
      } else {
        // レスポンスがない場合はネットワークエラーなど
        console.error(
          "Error: The request was made but no response was received"
        );
      }
    } else {
      // それ以外のエラータイプ
      console.error("Error:", error);
    }
  }
};
