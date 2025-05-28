import axios from "axios";

export const createPaymentIntent = async (
  amount: string
): Promise<{ clientSecret: string } | undefined> => {
  try {
    const response = await axios.post(
      "http://localhost:5001/create-payment-intent",
      {
        amount,
      }
    );

    return {
      clientSecret: response.data.clientSecret,
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
