import { useCallback } from "react";
import { createPaymentIntent, StripePaymentResponse } from "../api/creditApi";
import {
  createSetupIntent,
  updateDefaultPaymentMethod,
  checkReactivationStatusApi,
  reactivateAccountApi,
  PaymentMethod,
} from "../api/paymentMethodApis";

type useCreditReturn = {
  getCreatePaymentIntent: (
    amount: string,
    status: number
  ) => Promise<StripePaymentResponse | undefined>;
  updateDefaultPayment: (
    profileId: string,
    paymentMethodId: string
  ) => Promise<boolean>;
  createSetupIntentHandler: (paymentMethodId: string) => Promise<{
    clientSecret: string;
    setupIntentId: string;
  } | null>;
  checkReactivationStatus: (userId: number) => Promise<string>;
  reactivateAccount: (
    user_id: string,
    payment_method_id: string | null | PaymentMethod,
    plan_type: number
  ) => Promise<string>;
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

  const updateDefaultPayment = useCallback(
    async (profileId: string, paymentMethodId: string) => {
      const success = await updateDefaultPaymentMethod(
        profileId,
        paymentMethodId
      );

      return success;
    },
    []
  );

  // SetupIntentを作成
  const createSetupIntentHandler = useCallback(
    async (paymentMethodId: string) => {
      const result = await createSetupIntent(paymentMethodId);

      return result;
    },
    []
  );

  const checkReactivationStatus = async (userId: number) => {
    const response = await checkReactivationStatusApi(userId);

    return response.statusText;
  };

  const reactivateAccount = async (
    user_id: string,
    payment_method_id: string | null | PaymentMethod,
    plan_type: number
  ) => {
    const response = await reactivateAccountApi(
      user_id,
      payment_method_id,
      plan_type
    );
    return response?.statusText;
  };

  return {
    getCreatePaymentIntent,
    updateDefaultPayment,
    createSetupIntentHandler,
    checkReactivationStatus,
    reactivateAccount,
  };
};

export default useCredit;
