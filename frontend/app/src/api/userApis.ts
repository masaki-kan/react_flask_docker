import axios from "axios";
import { followListType, tagType } from "../types/listType";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const getUsersApi = async (
  myId: string
): Promise<
  | {
      users: followListType[];
      tags: tagType[];
    }
  | undefined
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
