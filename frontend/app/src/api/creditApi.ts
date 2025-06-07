import axios from "axios";
import { errorSweetalert2 } from "../component/alert/sweetalert2";

export const createPaymentIntent = async (
  amount: string,
  status: string
): Promise<{ clientSecret: string; stripeCustomerId: string } | undefined> => {
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
    };
  } catch (error: unknown) {
    // エラーが Error インスタンスかつ response プロパティを持っているか確認
    if (axios.isAxiosError(error)) {
      // Axios エラーで、かつレスポンスが存在する場合
      if (error.response) {
        // console.error("Login error:", error.response.data);
        errorSweetalert2("Login error");
      } else {
        // レスポンスがない場合はネットワークエラーなど
        errorSweetalert2("Login error");
        // console.error(
        //   "Error: The request was made but no response was received"
        // );
      }
    } else {
      // それ以外のエラータイプ
      errorSweetalert2("Error");
    }
  }
};
