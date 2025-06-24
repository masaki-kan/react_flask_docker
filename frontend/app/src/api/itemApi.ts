import axios from "axios";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const getUserItemsApi = async (
  myId: string
): Promise<
  | {
      items: {
        item_id: string;
        title: string;
        description: string;
        type: string;
        brand: { key: string; name: string }[];
        images: string[];
        uploaded_at: Date;
        profile_image: string;
        user_id: number;
        trade_status_flag: number;
      };
      brands: { key: string; name: string }[];
    }
  | undefined
> => {
  try {
    const response = await axios.post("http://localhost:5001/getUserItems", {
      user_id: myId,
    });

    return {
      items: response.data.items,
      brands: response.data.brands,
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
