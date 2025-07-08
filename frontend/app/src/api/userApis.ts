import axios from "axios";
import { followListType, tagType } from "../types/listType";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

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
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};
