import { FC, memo, useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Icon,
  Flex,
  Center,
  Badge,
} from "@chakra-ui/react";
import {
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaChevronLeft,
  FaUser,
  FaEnvelope,
  FaCheck,
} from "react-icons/fa";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import useCredit from "../../hooks/useCredit";
import useAlert from "../../hooks/useAlert";
import { singupApi } from "../../api/loginApis";
import { plansType, sinupFormType } from "../../types/loginType";
import { stripePromise } from "../../consts/stripe";

type Step3Props = {
  plans: plansType[];
  formData: sinupFormType;
  prevStep: () => void;
  loading: boolean;
  handleFinalSubmit: () => void;
  setFormData: (data: sinupFormType) => void;
  onSuccess: () => void;
};

// Stripe決済処理を行うコンポーネント
const CheckoutFormContent: FC<{
  formData: sinupFormType;
  onSuccess: () => void;
  prevStep: () => void;
  selectedPlan?: plansType;
  paymentType: "setup" | "payment";
  trialEnd?: string;
  nextBillingDate?: string;
  amount?: number;
}> = memo(
  ({
    formData,
    onSuccess,
    prevStep,
    selectedPlan,
    paymentType,
    trialEnd,
    nextBillingDate,
    amount,
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { sweetSuccessTextOverAlert, sweetErrorOverAlert } = useAlert();
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
      if (!stripe || !elements) return;
      if (!formData.clientSecret) {
        console.warn("clientSecret が未設定です");
        return;
      }

      setLoading(true);

      try {
        // elements.submit()を実行
        await elements.submit();

        // SetupIntentとPaymentIntentで処理を分岐
        if (paymentType === "setup") {
          // SetupIntent（月額プラン・初月無料）の場合
          const result = await stripe.confirmSetup({
            elements,
            clientSecret: formData.clientSecret,
            confirmParams: {
              payment_method_data: {
                billing_details: {
                  name: formData.username,
                  email: formData.email,
                },
              },
            },
            redirect: "if_required",
          });

          if (result.error) {
            await sweetErrorOverAlert();
          } else if (result.setupIntent?.status === "succeeded") {
            // APIを呼び出してユーザー登録
            const response = await singupApi({
              ...formData,
              setupIntentId: result.setupIntent.id,
              paymentType: "setup",
            });

            if (response.success === true) {
              await sweetSuccessTextOverAlert(
                "登録しました。30日間の無料期間後、月額500円が課金されます。"
              );
              onSuccess();
            } else {
              await sweetErrorOverAlert();
            }
          }
        } else {
          // PaymentIntent（年額プラン）の場合
          const result = await stripe.confirmPayment({
            elements,
            clientSecret: formData.clientSecret,
            confirmParams: {
              payment_method_data: {
                billing_details: {
                  name: formData.username,
                  email: formData.email,
                },
              },
            },
            redirect: "if_required",
          });

          if (result.error) {
            await sweetErrorOverAlert();
          } else if (result.paymentIntent?.status === "succeeded") {
            // APIを呼び出してユーザー登録
            const response = await singupApi({
              ...formData,
              intentId: result.paymentIntent.id,
              paymentType: "payment",
            });

            if (response?.success === true) {
              await sweetSuccessTextOverAlert(
                "登録しました。年額5,500円のお支払いが完了しました。"
              );
              onSuccess();
            } else {
              await sweetErrorOverAlert();
            }
          }
        }
      } catch (error) {
        console.error("処理中にエラーが発生しました:", error);
        await sweetErrorOverAlert();
      }

      setLoading(false);
    }, [
      stripe,
      elements,
      formData,
      paymentType,
      sweetErrorOverAlert,
      sweetSuccessTextOverAlert,
      onSuccess,
    ]);

    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            決済情報を入力
          </Heading>
          <Text color="gray.600">
            {paymentType === "setup"
              ? "カード情報を登録します（初月無料）"
              : "クレジットカード情報を安全に登録します"}
          </Text>
        </Box>

        {/* 登録情報の確認 */}
        <Box bg="gray.50" p={4} borderRadius="lg">
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            登録情報の確認
          </Text>
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FaUser} color="gray.400" />
              <Box>
                <Text fontSize="xs" color="gray.500">
                  氏名
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formData.username}
                </Text>
              </Box>
            </HStack>
            <HStack>
              <Icon as={FaEnvelope} color="gray.400" />
              <Box>
                <Text fontSize="xs" color="gray.500">
                  メールアドレス
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formData.email}
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Box>

        {/* 選択中のプラン */}
        <Box
          borderWidth={2}
          borderColor="orange.200"
          bg="orange.50"
          p={4}
          borderRadius="lg"
        >
          <Flex justify="space-between" align="start">
            <Box>
              <Text fontSize="sm" color="gray.600">
                選択中のプラン
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                {selectedPlan?.price}
              </Text>
              {paymentType === "setup" && (
                <Badge colorScheme="green" mt={1}>
                  初月無料トライアル付き
                </Badge>
              )}
            </Box>
            <Box textAlign="right">
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {paymentType === "setup"
                  ? "¥0"
                  : amount
                    ? `¥${amount.toLocaleString()}`
                    : selectedPlan?.price || "¥5,500"}
                <Text as="span" fontSize="sm" fontWeight="normal">
                  {paymentType === "setup" ? "（初月）" : selectedPlan?.period}
                </Text>
              </Text>
              {selectedPlan?.save && paymentType === "payment" && (
                <Badge colorScheme="green" fontSize="sm">
                  {selectedPlan?.save}
                </Badge>
              )}
            </Box>
          </Flex>

          {/* プラン特典 */}
          <VStack align="start" spacing={1} mt={3}>
            {selectedPlan?.features.map((feature: string, index: number) => (
              <HStack key={index} spacing={2} fontSize="sm">
                <Icon as={FaCheck} color="green.500" boxSize={3} />
                <Text>{feature}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* カード入力 */}
        <FormControl>
          <FormLabel>
            <HStack spacing={2}>
              <Icon as={FaCreditCard} />
              <Text>カード情報</Text>
            </HStack>
          </FormLabel>
          <Box
            borderWidth={2}
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
            bg="gray.50"
            _focusWithin={{ borderColor: "orange.500", bg: "white" }}
          >
            <PaymentElement
              options={{ layout: "tabs", paymentMethodOrder: ["card"] }}
            />
          </Box>
        </FormControl>

        {/* 月額プランの場合の注意事項 */}
        {paymentType === "setup" && trialEnd && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                初月無料について
              </Text>
              <Text fontSize="xs">
                登録から30日間は無料でご利用いただけます。
                31日目から月額500円が自動的に課金されます。
                いつでも解約可能です。
              </Text>
            </Box>
          </Alert>
        )}

        {/* 年額プランの場合の注意事項 */}
        {paymentType === "payment" && nextBillingDate && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                年額プランについて
              </Text>
              <Text fontSize="xs">
                1年ごとに自動更新されます。 次回の請求日は
                {new Date(nextBillingDate).toLocaleDateString("ja-JP")}です。
              </Text>
            </Box>
          </Alert>
        )}

        {/* セキュリティ情報 */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" fontSize="sm">
              安全な決済システム
            </Text>
            <Text fontSize="xs">
              お客様のカード情報は暗号化され、Stripeの安全なサーバーで処理されます。
              当サービスではカード情報を保存いたしません。
            </Text>
          </Box>
        </Alert>

        {/* アクションボタン */}
        <HStack spacing={3}>
          <Button
            flex={1}
            size="sm"
            variant="outline"
            onClick={prevStep}
            leftIcon={<FaChevronLeft />}
            isDisabled={loading}
          >
            戻る
          </Button>
          <Button
            flex={2}
            colorScheme="orange"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="処理中..."
          >
            {paymentType === "setup"
              ? "登録して無料で始める"
              : "登録して支払いを完了する"}
          </Button>
        </HStack>

        {/* セキュリティバッジ */}
        <HStack justify="center" spacing={6} fontSize="xs" color="gray.600">
          <HStack>
            <Icon as={FaLock} />
            <Text>SSL暗号化通信</Text>
          </HStack>
          <HStack>
            <Icon as={FaShieldAlt} />
            <Text>PCI-DSS準拠</Text>
          </HStack>
        </HStack>

        {/* 利用規約 */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          カード情報を提供すると、僕らのヴィンテージが
          その規約に従って今後の支払いをお客様のカードに
          請求することを許可することになります。
        </Text>
      </VStack>
    );
  }
);

const Step3: FC<Step3Props> = memo(
  ({ plans, formData, prevStep, setFormData, onSuccess }) => {
    const selectedPlan = plans.find((p) => p.id === formData.plan);
    const { getCreatePaymentIntent } = useCredit();
    const [clientSecret, setClientSecret] = useState("");
    const [isLoadingIntent, setIsLoadingIntent] = useState(true);
    const [paymentType, setPaymentType] = useState<"setup" | "payment">(
      "payment"
    );
    const [paymentDetails, setPaymentDetails] = useState<{
      trialEnd?: string;
      nextBillingDate?: string;
      amount?: number;
    }>({});

    useEffect(() => {
      const createPaymentIntent = async () => {
        setIsLoadingIntent(true);

        try {
          // plan "0" は月額プラン（status 0）、"1" は年額プラン（status 1）
          const planStatus = formData.plan === "0" ? 0 : 1;

          const response = await getCreatePaymentIntent(
            formData.plan === "0" ? "550" : "5500",
            planStatus
          );

          if (response) {
            setClientSecret(response.clientSecret);
            setPaymentType(response.type);
            setPaymentDetails({
              trialEnd: response.trialEnd,
              nextBillingDate: response.nextBillingDate,
              amount: response.amount,
            });

            setFormData({
              ...formData,
              clientSecret: response.clientSecret,
              stripeCustomerId: response.stripeCustomerId,
              subscriptionId: response.subscriptionId,
              intentId: response.intentId,
              paymentType: response.type,
              plan: response.plan === "monthly" ? "0" : "1",
            });
          }
        } catch (error) {
          console.error("Payment intent creation failed:", error);
        } finally {
          setIsLoadingIntent(false);
        }
      };

      if (!formData.clientSecret) {
        createPaymentIntent();
      } else {
        setClientSecret(formData.clientSecret);
        setPaymentType(formData.paymentType || "payment");
        setIsLoadingIntent(false);
      }
    }, [formData, getCreatePaymentIntent, setFormData]);

    if (isLoadingIntent) {
      return (
        <Center py={10}>
          <VStack>
            <Text>決済の準備中...</Text>
          </VStack>
        </Center>
      );
    }

    const options = { clientSecret };

    return (
      <Elements stripe={stripePromise} options={options}>
        <CheckoutFormContent
          formData={formData}
          onSuccess={onSuccess}
          prevStep={prevStep}
          selectedPlan={selectedPlan}
          paymentType={paymentType}
          {...paymentDetails}
        />
      </Elements>
    );
  }
);

export default Step3;
