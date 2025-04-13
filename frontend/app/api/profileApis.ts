import axios from "axios";
import { apiRetuenProfileType } from "../src/types/profile";

export const getMyProfileApi = async (
  id: string
): Promise<apiRetuenProfileType | undefined> => {
  try {
    const response = await axios.get("http://localhost:5001/getMyProfile", {
      params: {
        id: id,
      },
    });

    console.log(response.data);

    const profile = {
      id: response.data.profile.id,
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
    };

    return {
      profile,
      items: response.data.items,
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
