import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Box, Button, FormLabel, Heading, Input } from "@chakra-ui/react";
import { FC, useCallback, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import { sinupFormType } from "../../../types/loginType";
import { singupApi } from "../../../api/loginApis";

type checkoutFormType = {
  singUpEvent: () => Promise<void>;
  form: sinupFormType;
  loginClick: () => void;
};

const CheckoutForm: FC<checkoutFormType> = ({
  singUpEvent,
  form,
  loginClick,
}) => {
  const { sweetSuccessTextOverAlert, sweetErrorOverAlert, errorAlert } =
    useAlert();
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      singUpEvent();
      if (!stripe || !elements) return;
      setLoading(true);
      const response = await singupApi(form);
      if (response !== undefined) {
        if (response.result) {
          const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              payment_method_data: {
                billing_details: { name, email },
              },
              // return_url: window.location.href, 遷移させないなら不要
            },
            redirect: "if_required", // ← これが重要！
          });

          if (result.error) {
            sweetErrorOverAlert().then((result) => {
              if (result.isConfirmed) {
                loginClick();
                return;
              }
            });
          } else {
            sweetSuccessTextOverAlert(
              "登録しました。ログイン画面に移ります。"
            ).then((result) => {
              if (result.isConfirmed) {
                loginClick();
                return;
              }
            });
          }
          return;
        } else {
          errorAlert(response.message);
          setLoading(false);
          return;
        }
      }
    },
    [
      elements,
      email,
      errorAlert,
      form,
      loginClick,
      name,
      singUpEvent,
      stripe,
      sweetErrorOverAlert,
      sweetSuccessTextOverAlert,
    ]
  );

  return (
    <Box
      w="100%"
      mx="auto"
      my={4}
      p={6}
      bg="white"
      borderRadius="md"
      boxShadow="md"
      overflowY={"scroll"}
      height={"500px"}
    >
      <Heading size="sm" textAlign="center" mb={2}>
        クレジットカード情報を登録します
      </Heading>
      <form onSubmit={handleSubmit}>
        <Box my={4}>
          <FormLabel>氏名</FormLabel>
          <Input
            type="text"
            placeholder="山田 太郎"
            value={name}
            isRequired
            onChange={(e) => setName(e.target.value)}
          />
        </Box>

        <Box my={4}>
          <FormLabel>メールアドレス</FormLabel>
          <Input
            type="email"
            placeholder="taro@example.com"
            value={email}
            isRequired
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>
        <PaymentElement
          options={{ layout: "tabs", paymentMethodOrder: ["card"] }}
        />

        <Button
          type="submit"
          bgColor={"#e68019"}
          mt={6}
          w={"100%"}
          colorScheme="teal"
          isLoading={loading}
          mx={"auto"}
        >
          登録して無料から始める
        </Button>
      </form>
    </Box>
  );
};

export default CheckoutForm;
