import axios from "axios";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

export const createPaymentIntent = async (
  amount: string,
  status: string
): Promise<
  | { clientSecret: string; stripeCustomerId: string; intentId: string }
  | undefined
> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/create-payment-intent`,
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
    let errorMessage = "予期しないエラーが発生しました";

    if (axios.isAxiosError(error) && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    errorSweetalert2(errorMessage);
    return;
  }
};
