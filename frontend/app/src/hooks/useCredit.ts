import { useCallback } from "react";
import { createPaymentIntent } from "../api/creditApi";

type useCreditReturn = {
  getCreatePaymentIntent: (
    amount: string,
    status: string
  ) => Promise<
    | {
        clientSecret: string;
        stripeCustomerId: string;
        intentId: string;
      }
    | undefined
  >;
};

const useCredit = (): useCreditReturn => {
  const getCreatePaymentIntent = useCallback(
    async (
      amount: string,
      status: string
    ): Promise<
      | {
          clientSecret: string;
          stripeCustomerId: string;
          intentId: string;
        }
      | undefined
    > => {
      const clientSecret = await createPaymentIntent(amount, status);

      if (clientSecret !== undefined) {
        return {
          clientSecret: clientSecret.clientSecret,
          stripeCustomerId: clientSecret.stripeCustomerId,
          intentId: clientSecret.intentId,
        };
      }
    },
    []
  );
  return {
    getCreatePaymentIntent,
  };
};

export default useCredit;
