import { useCallback } from "react";
import { createPaymentIntent } from "../api/creditApi";

type useCreditReturn = {
  getCreatePaymentIntent: (amount: string) => Promise<string | undefined>;
};

const useCredit = (): useCreditReturn => {
  const getCreatePaymentIntent = useCallback(
    async (amount: string): Promise<string | undefined> => {
      const clientSecret = await createPaymentIntent(amount);

      if (clientSecret !== undefined) {
        console.log("clientSecret", clientSecret);
        return clientSecret.clientSecret;
      }
    },
    []
  );
  return {
    getCreatePaymentIntent,
  };
};

export default useCredit;
