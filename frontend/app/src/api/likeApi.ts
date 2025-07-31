import axios from "axios";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

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
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};
