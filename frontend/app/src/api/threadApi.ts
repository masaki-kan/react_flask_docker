// api/threadApi.ts
import axios from "axios";
import { createErrorResponse } from "../utils/alert/sweetalert2";

export const threadPostApi = async (userId: string, message: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/thread/post`,
      {
        user_id: userId,
        message: message,
      }
    );

    return {
      ok: response.data.result,
      data: response.data,
    };
  } catch (error: unknown) {
    let errorMessage = "投稿に失敗しました";
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    createErrorResponse(error, errorMessage);
    return {
      ok: false,
      error: errorMessage,
    };
  }
};

export const fetchThreadMessages = async (
  page: number,
  limit: number,
  filter: string,
  userId: string
) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/thread/messages`,
      {
        params: {
          page,
          limit,
          filter,
          user_id: userId,
        },
      }
    );

    return response.data;
  } catch (error) {
    let errorMessage = "投稿に失敗しました";
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    createErrorResponse(error, errorMessage);
    return {
      ok: false,
      error: errorMessage,
    };
  }
};

export const deleteThreadMessageApi = async (
  thread_message_id: number,
  user_id: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/thread/delete`,
      {
        thread_message_id,
        user_id,
      }
    );

    if (response.status === 200 && response.data.result) {
      return { ok: true };
    }
    return { ok: false };
  } catch (error) {
    let errorMessage = "投稿に失敗しました";
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    createErrorResponse(error, errorMessage);
    return {
      ok: false,
      error: errorMessage,
    };
  }
};
