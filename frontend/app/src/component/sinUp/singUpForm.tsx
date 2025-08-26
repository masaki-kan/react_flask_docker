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
import { sinupFormType, errorStateType } from "../../types/loginType";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import { FaCheck } from "react-icons/fa";
import { loginCheckApi } from "../../api/loginApis";
import useCredit from "../../hooks/useCredit";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

const SingUpForm: FC = memo(() => {
  const { getCreatePaymentIntent } = useCredit();
  const navigate = useNavigate();
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
    location: "",
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
      // plan "0" は月額プラン（status 0）、"1" は年額プラン（status 1）
      const planStatus = formData.plan === "0" ? 0 : 1;

      const response = await getCreatePaymentIntent(
        formData.plan === "0" ? "500" : "5500",
        planStatus
      );

      if (response !== undefined) {
        setFormData({
          ...formData,
          clientSecret: response.clientSecret,
          stripeCustomerId: response.stripeCustomerId,
          subscriptionId: response.subscriptionId,
          intentId: response.intentId,
          paymentType: response.type,
        });
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "決済の準備に失敗しました",
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
        await createPaymentIntent();
      }
      setCurrentStep((prevStep) => prevStep + 1);
    }
  }, [createPaymentIntent, currentStep, validateStep]);

  const handleFinalSubmit = async () => {
    setShowSuccess(true);
    setTimeout(() => {
      // ログイン画面へ遷移
      navigate(route.login);
    }, 2000);
  };

  // プラン情報
  const plans = [
    {
      id: "0",
      name: "月額プラン",
      price: "¥500",
      period: "/月",
      description: "毎月のお支払い",
      badge: "初月無料",
      color: "blue",
      features: [
        "出品・購入・取引が可能",
        "プロフィールカスタマイズ",
        "優先サポート対応",
      ],
    },
    {
      id: "1",
      name: "年額プラン",
      price: "¥5,500",
      period: "/年",
      description: "年間一括払い",
      badge: "お得！",
      save: "¥1,000お得!",
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
              <Button
                variant="link"
                colorScheme="orange"
                size="sm"
                onClick={() => {
                  navigate(route.login);
                }}
              >
                ログイン
              </Button>
            </Text>
          </Center>
          <Center mt={2}>
            <Text fontSize="sm" color="gray.500">
              <Button
                variant="link"
                colorScheme="orange"
                size="sm"
                onClick={() => {
                  navigate(route.top);
                }}
              >
                戻る
              </Button>
            </Text>
          </Center>
        </Container>
      </Box>
    </>
  );
});

export default SingUpForm;
