import axios from "axios";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const itemLikeApi = async (
  item_id: string,
  my_user_id: string
): Promise<
  { result: boolean; liked: boolean; message: string } | undefined
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/itemLike`,
      {
        item_id: item_id,
        my_user_id: my_user_id,
      }
    );

    return {
      result: response.data.result,
      liked: response.data.liked,
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
        console
          .error
          // "Error: The request was made but no response was received"
          ();
      }
    } else {
      // それ以外のエラータイプ
      errorSweetalert2("Error");
      // console.error("Error:", error);
    }
  }
};
