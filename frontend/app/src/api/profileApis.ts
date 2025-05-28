import axios from "axios";
import {
  apiRetuenProfileType,
  profileType,
  profileItemType,
} from "../types/profileType";
// import { sweetErrorAlert } from "../src/component/common/toast/alert";

// プロフ取得
export const getProfileApi = async (
  id: string,
  myId?: string
): Promise<apiRetuenProfileType | undefined> => {
  try {
    const response = await axios.get("http://localhost:5001/getProfile", {
      params: {
        id: id,
        my_id: myId ?? undefined,
      },
    });

    const profile = {
      id: id,
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
        };
      }
    );

    return {
      profile,
      items,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("getMyProfile error:", error.response.data);
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

// 自分のプロフ更新
export const postStoreProfileApi = async (formData: profileType) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/postStoreProfile",
      {
        userData: formData,
      }
    );

    return {
      status: response.data.result,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("postStoreProfile error:", error.response.data);
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

// 自分のプロフ 商品登録
export const postStoreProfileItemApi = async (
  formData: profileItemType,
  dateUpChange: string
) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/postStoreProfileItem",
      {
        itemData: formData,
        dateUpChange,
      }
    );

    return {
      status: response.data.result,
      message: response.data.message,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("postStoreProfile error:", error.response.data);
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
