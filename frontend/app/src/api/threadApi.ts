import axios from "axios";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

export const threadPostApi = async (
  user_id: string | null,
  message: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/thread/post`,
      {
        user_id: message,
      }
    );

    return response;
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};
