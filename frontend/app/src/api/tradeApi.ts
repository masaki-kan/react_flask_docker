import axios from "axios";
import { savedListType } from "../types/savedType";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const tradeApi = async (
  item_id: string,
  buyer_id: string,
  seller_id: string
): Promise<{ result: boolean; message: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/trade`,
      {
        item_id: item_id,
        buyer_id: buyer_id,
        seller_id: seller_id,
      }
    );

    return {
      result: response.data.result,
      message: response.data.message,
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

export const getSavedList = async (
  user_id: string
): Promise<{ trades: savedListType[]; result: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/getSavedList`,
      {
        user_id,
      }
    );

    return {
      trades: response.data.trades,
      result: response.data.result,
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

export const trageStatusChange = async (
  trade_id: string,
  status: string
): Promise<{ trades: savedListType[]; result: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/trade_status_change`,
      {
        trade_id,
        status,
      }
    );

    return {
      trades: response.data.trades,
      result: response.data.result,
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
