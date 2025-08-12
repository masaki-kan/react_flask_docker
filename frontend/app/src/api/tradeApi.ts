import axios from "axios";
import { savedListType } from "../types/savedType";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

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
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};

export const getSavedList = async (
  user_id: string
): Promise<
  | {
      trades: savedListType[];
      result: string;
      cancelled_trades?: {
        trade_id: string;
        item_title: string;
      }[];
    }
  | undefined
> => {
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
      cancelled_trades: response.data.cancelled_trades,
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
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};
