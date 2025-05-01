import axios from "axios";

export const getUserItemsApi = async (
  myId: string
): Promise<
  | {
      items: {
        item_id: string;
        title: string;
        price: number;
        curr: string;
        description: string;
        type: string;
        brand: { key: string; name: string }[];
        images: string[];
        uploaded_at: Date;
        profile_image: string;
        user_id: number;
      };
      brands: { key: string; name: string }[];
    }
  | undefined
> => {
  try {
    const response = await axios.post("http://localhost:5001/getUserItems", {
      user_id: myId,
    });

    return {
      items: response.data.items,
      brands: response.data.brands,
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
