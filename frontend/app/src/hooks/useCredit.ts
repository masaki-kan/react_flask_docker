import { useCallback } from "react";
import { createPaymentIntent, StripePaymentResponse } from "../api/creditApi";

type useCreditReturn = {
  getCreatePaymentIntent: (
    amount: string,
    status: number
  ) => Promise<StripePaymentResponse | undefined>;
};

const useCredit = (): useCreditReturn => {
  const getCreatePaymentIntent = useCallback(
    async (
      amount: string,
      status: number
    ): Promise<StripePaymentResponse | undefined> => {
      const response = await createPaymentIntent(amount, status);
      return response;
    },
    []
  );
  return {
    getCreatePaymentIntent,
  };
};

export default useCredit;
