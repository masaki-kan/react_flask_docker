import { FC, memo, useCallback, useState } from "react";
import {
  Heading,
  Box,
  Button,
  useToast,
  Modal,
  Center,
  Container,
  Icon,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VStack,
  Progress,
  Text,
} from "@chakra-ui/react";
import { sinupFormType, errorStateType } from "../../../types/loginType";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./step3";
import { FaCheck } from "react-icons/fa";
import { loginCheckApi } from "../../../api/loginApis";
import useCredit from "../../../hooks/useCredit";

const SingUpForm: FC = memo(() => {
  const { getCreatePaymentIntent } = useCredit();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<errorStateType>({
    username: "",
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState<sinupFormType>({
    username: "",
    email: "",
    password: "",
    plan: "1",
    clientSecret: "",
    stripeCustomerId: "",
    intentId: "",
  });

  // バリデーション関数は同じ
  const validateStep = useCallback(
    async (step: number) => {
      const newErrors = {
        username: "",
        email: "",
        password: "",
      };

      if (step === 1) {
        if (!formData.username.trim()) {
          newErrors.username = "氏名を入力してください";
        }
        if (!formData.email.trim()) {
          newErrors.email = "メールアドレスを入力してください";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "有効なメールアドレスを入力してください";
        }
        if (!formData.password) {
          newErrors.password = "パスワードを入力してください";
        } else if (
          formData.password.length < 8 ||
          formData.password.length > 16
        ) {
          newErrors.password =
            "パスワードは8文字以上16文字以下で入力してください";
        } else if (!/^[a-zA-Z0-9]+$/.test(formData.password)) {
          newErrors.password = "パスワードは半角英数字のみ使用できます";
        } else {
          const response = await loginCheckApi(formData);
          if (response?.result) {
            newErrors.email =
              "このメールアドレスはすでに登録されております。別のアドレスで登録してください。";
          }
        }
      }

      setErrors(newErrors);
      return Object.values(newErrors).every((val) => val === "");
    },
    [formData]
  );

  const createPaymentIntent = useCallback(async () => {
    setLoading(true);
    try {
      // API呼び出し処理
      const secret = await getCreatePaymentIntent(
        formData.plan === "1" ? "550" : "5500",
        formData.plan
      );

      if (secret !== undefined)
        setFormData({
          ...formData,
          clientSecret: secret.clientSecret,
          stripeCustomerId: secret.stripeCustomerId,
          intentId: secret.intentId,
        });
    } catch (error) {
      toast({
        title: "エラー",
        description: "Payment Intent の作成に失敗しました",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [formData, getCreatePaymentIntent, toast]);

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const nextStep = useCallback(async () => {
    if (await validateStep(currentStep)) {
      if (currentStep === 2) {
        createPaymentIntent();
      }
      setCurrentStep((prevStep) => prevStep + 1);
    }
  }, [createPaymentIntent, validateStep]);

  const handleFinalSubmit = async () => {
    setShowSuccess(true);
    setTimeout(() => {
      // 実際はログイン画面へ遷移
      window.location.href = "/login"; // または適切なルーティング処理
    }, 2000);
  };

  // プラン情報
  const plans = [
    {
      id: "1",
      name: "月額プラン",
      price: "¥550",
      period: "/月",
      description: "毎月のお支払い",
      badge: "ベーシック",
      color: "blue",
      features: [
        "出品・購入・取引が可能",
        "プロフィールカスタマイズ",
        "優先サポート対応",
      ],
    },
    {
      id: "2",
      name: "年額プラン",
      price: "¥5,500",
      period: "/年",
      description: "年間一括払い",
      badge: "お得！",
      save: "¥1,100お得!",
      color: "orange",
      recommended: true,
      features: [
        "出品・購入・取引が可能",
        "プロフィールカスタマイズ",
        "優先サポート対応",
      ],
    },
  ];

  // プログレスバー
  const ProgressBar = () => (
    <Box mb={8}>
      <Progress value={currentStep * 33.33} colorScheme="orange" mb={4} />
      <VStack justify="space-between">
        <Text
          fontSize="sm"
          color={currentStep === 1 ? "orange.600" : "gray.500"}
          fontWeight={currentStep === 1 ? "bold" : "normal"}
        >
          基本情報
        </Text>
        <Text
          fontSize="sm"
          color={currentStep === 2 ? "orange.600" : "gray.500"}
          fontWeight={currentStep === 2 ? "bold" : "normal"}
        >
          プラン選択
        </Text>
        <Text
          fontSize="sm"
          color={currentStep === 3 ? "orange.600" : "gray.500"}
          fontWeight={currentStep === 3 ? "bold" : "normal"}
        >
          決済情報
        </Text>
      </VStack>
    </Box>
  );

  return (
    <>
      <Box minH="100vh" bg="gray.50" py={8}>
        {/* 成功モーダル */}
        <Modal isOpen={showSuccess} onClose={() => {}} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalBody py={8}>
              <VStack spacing={4}>
                <Center w={20} h={20} bg="green.100" borderRadius="full">
                  <Icon as={FaCheck} boxSize={10} color="green.600" />
                </Center>
                <Heading size="lg">登録完了！</Heading>
                <Text color="gray.600">ようこそ、僕らのヴィンテージへ！</Text>
                <Text fontSize="sm" color="gray.500">
                  ログイン画面に移動します...
                </Text>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Container maxW="container.md">
          {/* ヘッダー */}

          {/* メインカード */}
          <Box bg="white" borderRadius="2xl" shadow="xl" p={8}>
            <ProgressBar />
            {currentStep === 1 && (
              <Step1
                errors={errors}
                formData={formData}
                setFormData={setFormData}
                nextStep={nextStep}
              />
            )}
            {currentStep === 2 && (
              <Step2
                formData={formData}
                setFormData={setFormData}
                nextStep={nextStep}
                plans={plans}
                prevStep={prevStep}
                loading={loading}
              />
            )}
            {currentStep === 3 && (
              <Step3
                plans={plans}
                formData={formData}
                prevStep={prevStep}
                loading={loading}
                handleFinalSubmit={handleFinalSubmit}
                setFormData={setFormData}
                onSuccess={handleFinalSubmit}
              />
            )}
          </Box>
          {/* フッター */}
          <Center mt={6}>
            <Text fontSize="sm" color="gray.500">
              すでにアカウントをお持ちですか？{" "}
              <Button variant="link" colorScheme="orange" size="sm">
                ログイン
              </Button>
            </Text>
          </Center>
        </Container>
      </Box>
    </>
  );
});

export default SingUpForm;
