import axios from "axios";
import { savedListType } from "../types/savedType";
import { tradeApprovalListType } from "../types/approvalType";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

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

// 取引申請
export const tradeApprovalRequestApi = async (
  item_id: string,
  requester_id: string
): Promise<{ result: boolean; message: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/trade_approval/request`,
      {
        item_id,
        requester_id,
      }
    );

    return {
      result: response.data.result,
      message: response.data.message,
    };
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      console.log("error.response", error.response);
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};

// 取引申請リスト取得
export const getTradeApprovalListApi = async (
  user_id: string
): Promise<
  | {
      received_approvals: tradeApprovalListType[];
      sent_approvals: tradeApprovalListType[];
    }
  | undefined
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/trade_approval/list`,
      {
        user_id,
      }
    );

    return {
      received_approvals: response.data.received_approvals,
      sent_approvals: response.data.sent_approvals,
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

// 承認 却下
export const postTradeApprovalRespondApi = async (
  approval_id: number,
  status: number,
  user_id: string
): Promise<{ result: boolean; message: string } | undefined> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/trade_approval/respond`,
      {
        user_id,
        approval_id,
        status,
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
