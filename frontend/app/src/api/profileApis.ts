import axios from "axios";
import {
  apiRetuenProfileType,
  profileType,
  // profileItemType,
} from "../types/profileType";
import { errorSweetalert2 } from "../component/common/alert/sweetalert2";

// プロフ取得
export const getProfileApi = async (
  id: number,
  myId?: number
): Promise<apiRetuenProfileType | undefined> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/getProfile`,
      {
        params: {
          id: id,
          my_id: myId ?? undefined,
        },
      }
    );

    const profile = {
      id: String(id),
      image: response.data.profile.image,
      name: response.data.profile.name,
      location: response.data.profile.location,
      old: response.data.profile.old,
      age: response.data.profile.age,
      tag: response.data.profile.tags,
      favoriteShop: {
        name: response.data.profile.shop_name,
        url: response.data.profile.shop_url,
      },
      reasen: response.data.profile.reasen,
      is_following: response.data.profile.is_following,
      likes: response.data.profile.likes,
      plan: response.data.profile.plan,
      tradeStatusFlag: response.data.profile.trade_status_flag,
    };

    const items = response.data.items.map(
      (items: {
        item_id: string;
        title: string;
        description: string;
        images: { image_url: string }[];
        brand: { key: string; name: string };
        price: string;
        curr: string;
        type: string;
        uploaded_at: Date;
        trade_status_flag: number;
      }) => {
        return {
          itemId: items.item_id,
          title: items.title,
          description: items.description,
          images: items.images,
          price: items.price,
          type: items.type,
          curr: items.curr,
          brand: items.brand,
          uploaded_at: items.uploaded_at,
          tradeStatusFlag: items.trade_status_flag,
        };
      }
    );

    return {
      profile,
      items,
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

// 自分のプロフ更新
export const postStoreProfileApi = async (formData: profileType) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/postStoreProfile`,
      {
        userData: formData,
      }
    );

    return {
      message: response.data.message,
      status: response.data.result,
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

// 自分のプロフ 商品登録
export const postStoreProfileItemApi = async (formData: FormData) => {
  try {
    console.log("formData", formData);
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/postStoreProfileItem`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      status: response.data.result,
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

// 退会処理
export const cancellationProcessApi = async (userID: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/cancellationProcess`,
      {
        userID,
      }
    );

    return response.data.message;
  } catch (error: unknown) {
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};

// 自分のプロフ 商品削除
export const deleteUserItemApi = async (
  item_id: string,
  my_user_id: number
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/deleteUserItem`,
      {
        item_id,
        my_user_id: my_user_id,
      }
    );

    return {
      status: response.data.result,
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
