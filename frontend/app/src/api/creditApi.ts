import axios from "axios";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const createPaymentIntent = async (
  amount: string,
  status: string
): Promise<
  | { clientSecret: string; stripeCustomerId: string; intentId: string }
  | undefined
> => {
  try {
    const response = await axios.post(
      "http://localhost:5001/create-payment-intent",
      {
        amount,
        status,
      }
    );

    return {
      clientSecret: response.data.clientSecret,
      stripeCustomerId: response.data.stripeCustomerId,
      intentId: response.data.intentId,
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        console.error("response error:", error.response.data);
        errorSweetalert2("Error");
      } else {
        // レスポンスがない場合はネットワークエラーなど
        errorSweetalert2("Error");
        console.error(
          "Error: The request was made but no response was received"
        );
      }
    } else {
      // それ以外のエラータイプ
      console.error("Login それ以外のエラータイプ:");
      errorSweetalert2("Error");
    }
  }
};
