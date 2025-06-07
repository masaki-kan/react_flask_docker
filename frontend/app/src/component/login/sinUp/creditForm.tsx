import { FC, useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./checkoutForm";
import { sinupFormType, stepsStatueType } from "../../../types/loginType";
import useCredit from "../../../hooks/useCredit";

const stripePromise = loadStripe(
  "pk_test_51RSeMLPtSoh6v635qwxrtEdecuniNskaZuq1ly2DKmB3gYWBGyZke1FnZKluX5rL3ux0trPXKvIFUWi3JEAaU0FA00OratpnfV"
);

type SelectedPlanView = {
  singUpEvent: () => Promise<void>;
  stepStatue: stepsStatueType;
  form: sinupFormType;
  changePlanHandler: (nextValue: string) => void;
  loginClick: () => void;
  changeStripeCustomerIdHandler: (stripeCustomerId: string) => void;
};

const CreditForm: FC<SelectedPlanView> = ({
  form,
  stepStatue,
  singUpEvent,
  loginClick,
  changeStripeCustomerIdHandler,
}) => {
  const { getCreatePaymentIntent } = useCredit();
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    (async () => {
      const secret = await getCreatePaymentIntent(
        form.plan === "1" ? "550" : "5500",
        form.plan
      );
      if (secret) {
        setClientSecret(secret.clientSecret);
        changeStripeCustomerIdHandler(secret.stripeCustomerId);
      }
    })();
  }, [changeStripeCustomerIdHandler, form.plan, getCreatePaymentIntent]);

  const options = {
    clientSecret,
  };

  return (
    <>
      {stepStatue.credit && clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            singUpEvent={singUpEvent}
            form={form}
            loginClick={loginClick}
          />
        </Elements>
      )}
    </>
  );
};

export default CreditForm;
