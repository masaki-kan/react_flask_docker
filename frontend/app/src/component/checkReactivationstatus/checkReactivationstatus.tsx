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
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import {
  FaCreditCard,
  FaLock,
  FaShieldAlt,
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
import useMyProfile from "../../hooks/useProfile";
import useAlert from "../../hooks/useAlert";
import { stripePromise } from "../../consts/stripe";
import { profileType } from "../../types/profileType";
import axios from "axios";
import useLog from "../../hooks/useLog";
import { createErrorResponse } from "../../utils/alert/sweetalert2";
import { useNavigate } from "react-router-dom";
import useCredit from "../../hooks/useCredit";
import { route } from "../../route/routeConst";

// 決済フォームのコンテンツ
const ReactivationForm: FC<{
  profile: profileType;
  onCancel: () => void;
  clientSecret: string;
  planType: "monthly" | "yearly";
}> = memo(({ profile, onCancel, clientSecret, planType }) => {
  const stripe = useStripe();
  const elements = useElements();
  const {
    sweetSuccessTextOverAlert,
    sweetErrorOverAlert,
    sweetStripeErrorOverAlert,
  } = useAlert();
  const [loading, setLoading] = useState(false);
  const { reactivateAccount } = useCredit();
  const { getMyProfile } = useMyProfile();

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      await elements.submit();

      // SetupIntentで確認（支払い方法の登録）
      const result = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: profile.name,
              email: profile.email,
            },
          },
        },
        redirect: "if_required",
      });

      if (result.error) {
        await sweetStripeErrorOverAlert();
      } else if (result.setupIntent?.status === "succeeded") {
        // 再アクティベーション実行

        const paymentMethodId = result.setupIntent.payment_method as string;

        const response = await reactivateAccount(
          profile.id,
          paymentMethodId,
          planType === "monthly" ? 0 : 1
        );

        if (response === "OK") {
          // プロフィール情報を再取得して最新の状態にする

          await sweetSuccessTextOverAlert(
            planType === "monthly"
              ? "アカウントを再開しました。月額550円が課金されます。"
              : "アカウントを再開しました。年額5,500円のお支払いが完了しました。"
          );
          // 少し待ってからナビゲーション実行
          setTimeout(() => {
            getMyProfile();
          }, 500);
        } else {
          // console.log("Reactivation failed, response was:", response);
          await sweetErrorOverAlert();
        }
      }
    } catch (error: unknown) {
      return createErrorResponse(
        error,
        "アカウント再開中にエラーが発生しました"
      );
    }

    setLoading(false);
  }, [
    stripe,
    elements,
    clientSecret,
    profile.name,
    profile.email,
    profile.id,
    sweetStripeErrorOverAlert,
    reactivateAccount,
    planType,
    sweetSuccessTextOverAlert,
    getMyProfile,
    sweetErrorOverAlert,
  ]);

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" mb={2}>
          アカウントを再開
        </Heading>
        <Text color="gray.600">支払い方法を登録してサービスを再開します</Text>
      </Box>

      {/* 再開通知 */}
      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            お帰りなさい！
          </Text>
          <Text fontSize="xs">
            アカウントを再開するには、支払い方法の登録が必要です。
            {planType === "monthly"
              ? "月額プランでご利用いただけます。"
              : "年額プランをお選びいただきありがとうございます。"}
          </Text>
        </Box>
      </Alert>

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
                {profile.name}
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
                {profile.email}
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
              {planType === "monthly" ? "月額プラン" : "年額プラン"}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="2xl" fontWeight="bold" color="orange.600">
              {planType === "monthly" ? "¥550" : "¥5,500"}
              <Text as="span" fontSize="sm" fontWeight="normal">
                {planType === "monthly" ? "/月" : "/年"}
              </Text>
            </Text>
            {planType === "yearly" && (
              <Badge colorScheme="green" fontSize="sm">
                2ヶ月分無料
              </Badge>
            )}
          </Box>
        </Flex>

        {/* プラン特典 */}
        <VStack align="start" spacing={1} mt={3}>
          <HStack spacing={2} fontSize="sm">
            <Icon as={FaCheck} color="green.500" boxSize={3} />
            <Text>全ての機能が利用可能</Text>
          </HStack>
          <HStack spacing={2} fontSize="sm">
            <Icon as={FaCheck} color="green.500" boxSize={3} />
            <Text>無制限の出品</Text>
          </HStack>
          <HStack spacing={2} fontSize="sm">
            <Icon as={FaCheck} color="green.500" boxSize={3} />
            <Text>優先サポート</Text>
          </HStack>
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
          onClick={onCancel}
          isDisabled={loading}
        >
          キャンセル
        </Button>
        <Button
          flex={2}
          colorScheme="orange"
          size="sm"
          onClick={handleSubmit}
          isLoading={loading}
          loadingText="処理中..."
        >
          アカウントを再開する
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
    </VStack>
  );
});

// メインコンポーネント
const CheckReactivationStatus: FC = () => {
  const { logOutHandler } = useLog();
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const { checkReactivationStatus } = useCredit();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (memorizeProfile?.profile.is_deleted === 0) {
      navigate(route.profile);
    }
    const checkStatus = async () => {
      if (!memorizeProfile?.profile?.id) return;

      if (memorizeProfile?.profile.is_deleted === 0) {
        // アクティブなアカウントの場合は通常の画面へ戻る
        setIsLoading(false);
        return;
      }

      try {
        const response = await checkReactivationStatus(
          Number(memorizeProfile.profile.id)
        );

        if (response === "OK") {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    };

    checkStatus();
  }, [checkReactivationStatus, memorizeProfile, navigate]);

  // APIコール関数を修正
  const createReactivationPaymentIntent = async (
    userId: string,
    planType: 0 | 1
  ) => {
    const response = await axios.post("/api/reactivation-payment-intent", {
      user_id: userId,
      plan_type: planType,
    });

    return response.data;
  };

  const handlePlanSelection = async () => {
    try {
      const planType = selectedPlan === "monthly" ? 0 : 1;
      const response = await createReactivationPaymentIntent(
        memorizeProfile.profile.id,
        planType
      );

      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        console.error("Failed to create payment intent:", response.error);
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const handleCancel = async () => {
    // 強制ログアウト
    const confirm = window.confirm(
      "操作を中断してログアウトします。よろしいですか？"
    );
    if (confirm) {
      logOutHandler();
    }
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Text>確認中...</Text>
      </Center>
    );
  }

  return (
    <>
      {!clientSecret ? (
        <VStack spacing={4} align="stretch">
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">お帰りなさい！</Text>
              <Text fontSize="sm">
                サービスを再開するには、プランを選択して支払い方法を登録してください。
              </Text>
            </Box>
          </Alert>

          <RadioGroup
            value={selectedPlan}
            onChange={(value: "monthly" | "yearly") => setSelectedPlan(value)}
          >
            <Stack spacing={3}>
              <Box
                borderWidth={2}
                borderColor={
                  selectedPlan === "monthly" ? "orange.500" : "gray.200"
                }
                borderRadius="lg"
                p={4}
                cursor="pointer"
                onClick={() => setSelectedPlan("monthly")}
              >
                <Radio value="monthly">
                  <Box ml={2}>
                    <HStack>
                      <Text fontWeight="bold">月額プラン</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      ¥550/月
                    </Text>
                  </Box>
                </Radio>
              </Box>

              <Box
                borderWidth={2}
                borderColor={
                  selectedPlan === "yearly" ? "orange.500" : "gray.200"
                }
                borderRadius="lg"
                p={4}
                cursor="pointer"
                onClick={() => setSelectedPlan("yearly")}
              >
                <Radio value="yearly">
                  <Box ml={2}>
                    <HStack>
                      <Text fontWeight="bold">年額プラン</Text>
                      <Badge colorScheme="orange">2ヶ月分無料</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      ¥5,500/年
                    </Text>
                  </Box>
                </Radio>
              </Box>
            </Stack>
          </RadioGroup>

          <HStack spacing={3} mt={4}>
            <Button variant="outline" onClick={handleCancel} flex={1}>
              キャンセル
            </Button>
            <Button colorScheme="orange" onClick={handlePlanSelection} flex={2}>
              次へ進む
            </Button>
          </HStack>
        </VStack>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <ReactivationForm
            profile={memorizeProfile.profile}
            onCancel={handleCancel}
            clientSecret={clientSecret}
            planType={selectedPlan}
          />
        </Elements>
      )}
    </>
  );
};

export default CheckReactivationStatus;
