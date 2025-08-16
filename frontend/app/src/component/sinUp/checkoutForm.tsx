import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Box, Button, FormLabel, Heading, Input } from "@chakra-ui/react";
import { FC, memo, useCallback, useState } from "react";
import useAlert from "../../hooks/useAlert";
import { sinupFormType } from "../../types/loginType";
import { singupApi } from "../../api/loginApis";

type checkoutFormType = {
  singUpEvent: () => Promise<void>;
  form: sinupFormType;
  loginClick: () => void;
};

const CheckoutForm: FC<checkoutFormType> = memo(
  ({ singUpEvent, form, loginClick }) => {
    const { sweetSuccessTextOverAlert, sweetErrorOverAlert } = useAlert();
    const stripe = useStripe();
    const elements = useElements();
    const [name, setName] = useState(form.username);
    const [email, setEmail] = useState(form.email);
    const [loading, setLoading] = useState<boolean>(false);
    const [responseResult, setResponseResult] = useState<boolean>(false);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        if (!form.clientSecret) {
          console.warn("clientSecret が未設定です");
          return;
        }
        if (responseResult) return;

        singUpEvent();
        setLoading(true);

        // const result = await stripe.confirmPayment({
        //   elements,
        //   redirect: "if_required",
        // });
        try {
          // ✅ 必須：まず elements.submit()
          await elements.submit();

          // ✅ その後に confirmPayment を実行
          const result = await stripe.confirmPayment({
            elements,
            clientSecret: form.clientSecret,
            confirmParams: {
              payment_method_data: {
                billing_details: {
                  name: form.username,
                  email: form.email,
                },
              },
            },
            redirect: "if_required",
          });

          if (result.error) {
            await sweetErrorOverAlert();
            loginClick();
          } else if (result.paymentIntent?.status === "succeeded") {
            setResponseResult(true);
            const response = await singupApi({
              ...form,
              intentId: result.paymentIntent.id,
            });

            if (response?.result) {
              await sweetSuccessTextOverAlert(
                "登録しました。ログイン画面に移ります。"
              );
              loginClick();
            } else {
              await sweetErrorOverAlert();
              loginClick();
            }
          } else {
            console.log("❌ 支払いが完了していません。");
            await sweetErrorOverAlert();
            loginClick();
          }
        } catch (error) {
          console.error("処理中にエラーが発生しました:", error);
          await sweetErrorOverAlert();
        }

        setLoading(false);
      },
      [
        elements,
        form,
        loginClick,
        responseResult,
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
          bgColor={"#e68019"}
          mt={6}
          w={"100%"}
          colorScheme="teal"
          isLoading={loading}
          mx={"auto"}
          onClick={handleSubmit}
        >
          登録して無料から始める
        </Button>
      </Box>
    );
  }
);

export default CheckoutForm;
