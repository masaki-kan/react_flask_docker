import axios from "axios";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

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
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getUserItems`,
      {
        user_id: myId,
      }
    );

    return {
      items: response.data.items,
      brands: response.data.brands,
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
