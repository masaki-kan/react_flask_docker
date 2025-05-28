import axios from "axios";
import { chatItemDataType } from "../types/chatType";

export const getChatItemDetailApi = async (
  item_id: string
): Promise<{ result: boolean; item: chatItemDataType } | undefined> => {
  try {
    const response = await axios.post(
      "http://localhost:5001/getChatItemDetail",
      {
        item_id,
      }
    );

    return {
      result: response.data.result,
      item: response.data.item,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("Login error:", error.response.data);
      } else {
        // レスポンスがない場合はネットワークエラーなど
        console.error(
          "Error: The request was made but no response was received"
        );
      }
    } else {
      // それ以外のエラータイプ
      console.error("Error:", error);
    }
  }
};

export const uploadImageApi = async (
  fileData: File
): Promise<{ imageUrl: string } | undefined> => {
  try {
    const formData = new FormData();
    formData.append("image", fileData);
    const response = await axios.post(
      "http://localhost:5001/upload_image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("response", response.data.image_url);

    return {
      imageUrl: response.data.image_url,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("Login error:", error.response.data);
      } else {
        // レスポンスがない場合はネットワークエラーなど
        console.error(
          "Error: The request was made but no response was received"
        );
      }
    } else {
      // それ以外のエラータイプ
      console.error("Error:", error);
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
    }
  | undefined
> => {
  try {
    const response = await axios.get(
      `http://localhost:5001/get_trade_messages?trade_id=${tradeIdNumver}`
    );
    return {
      messages: response.data.messages,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("Login error:", error.response.data);
      } else {
        // レスポンスがない場合はネットワークエラーなど
        console.error(
          "Error: The request was made but no response was received"
        );
      }
    } else {
      // それ以外のエラータイプ
      console.error("Error:", error);
    }
  }
};
