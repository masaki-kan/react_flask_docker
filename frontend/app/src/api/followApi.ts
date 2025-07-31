import axios from "axios";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

export const userFollewApi = async (
  user_id: string,
  my_user_id: string
): Promise<{ result: boolean; action: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/userFollow`,
      {
        follew_user_id: user_id,
        my_user_id,
      }
    );

    return {
      result: response.data.result,
      action: response.data.action,
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
