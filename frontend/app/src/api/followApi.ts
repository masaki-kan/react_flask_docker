import axios from "axios";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const userFollewApi = async (
  user_id: string,
  my_user_id: string
): Promise<{ result: boolean; action: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/userFollow`,
      {
        follew_user_id: user_id,
        my_user_id: my_user_id,
      }
    );

    return {
      result: response.data.result,
      action: response.data.action,
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
      errorSweetalert2("Error");
      // それ以外のエラータイプ
      // console.error("Error:", error);
    }
  }
};
