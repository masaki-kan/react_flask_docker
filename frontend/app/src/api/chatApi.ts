import axios from "axios";
import { chatItemDataType } from "../types/chatType";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

export const getChatItemDetailApi = async (
  item_id: string
): Promise<{ result: boolean; item?: chatItemDataType } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getChatItemDetail`,
      {
        item_id,
      }
    );

    return {
      result: response.data.result,
      item: response.data.item,
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

export const uploadImageApi = async (
  fileData: File
): Promise<{ imageUrl: string } | undefined> => {
  try {
    const formData = new FormData();
    formData.append("image", fileData);
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/upload_image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      imageUrl: response.data.image_url,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("Login error:", error.response.data);
        errorSweetalert2("Error");
      } else {
        // レスポンスがない場合はネットワークエラーなど
        console.error(
          "Error: The request was made but no response was received"
        );
        errorSweetalert2("Error");
      }
    } else {
      // それ以外のエラータイプ
      console.error("Error:", error);
      errorSweetalert2("Error");
    }
  }
};

export const getMessagesApi = async (
  tradeIdNumver: string
): Promise<
  | {
      messages: {
        sender_id: string;
        message: string;
        sent_at: Date;
        sender_image_url: string;
      }[];
      result: boolean;
    }
  | undefined
> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/get_trade_messages?trade_id=${tradeIdNumver}`
    );
    return {
      result: response.data.result,
      messages: response.data.messages,
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
