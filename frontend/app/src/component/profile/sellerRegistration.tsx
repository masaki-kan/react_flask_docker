/**
 * 販売者登録セクション
 * Stripe Connected Accountの登録とステータス表示
 */

import { FC, useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
  useToast,
  useColorModeValue,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FaStore,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  createConnectAccount,
  checkAccountStatus,
  getDashboardLink,
} from "../../api/stripeConnect";
import useMyProfile from "../../hooks/useProfile";

const SellerRegistration: FC = () => {
  const toast = useToast();
  const { memorizeProfile, getMyProfile } = useMyProfile();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{
    hasAccount: boolean;
    onboardingCompleted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    isTestMode: boolean;
  } | null>(null);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("blue.50", "blue.900");

  // Stripeアカウントの状態を確認
  const checkStatus = useCallback(async () => {
    const userId = memorizeProfile.profile.id;
    if (!userId) return;

    setCheckingStatus(true);
    try {
      const response = await checkAccountStatus(userId);

      if (response.success && response.data) {
        setAccountStatus({
          hasAccount: true,
          onboardingCompleted: response.data.onboarding_completed,
          chargesEnabled: response.data.charges_enabled,
          payoutsEnabled: response.data.payouts_enabled,
          isTestMode: response.data.is_test_mode || false,
        });
      } else {
        setAccountStatus({
          hasAccount: false,
          onboardingCompleted: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          isTestMode: false,
        });
      }
    } catch (error) {
      console.error("Status check error:", error);
    } finally {
      setCheckingStatus(false);
    }
  }, [memorizeProfile.profile.id]);

  // 初回ロード時にステータス確認
  useEffect(() => {
    if (memorizeProfile.profile.id) {
      checkStatus();
    }
  }, [memorizeProfile.profile.id, checkStatus]);

  // URLパラメータでオンボーディング完了を検知
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_onboarding") === "success") {
      toast({
        title: "販売者登録完了",
        description: "Stripeの登録が完了しました",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // ステータスを更新
      checkStatus();
      getMyProfile();

      // URLパラメータをクリア
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast, checkStatus, getMyProfile]);

  // 販売者登録を開始
  const handleRegisterSeller = async () => {
    const userId = memorizeProfile.profile.id;
    if (!userId) {
      toast({
        title: "エラー",
        description: "ユーザー情報が取得できません",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await createConnectAccount(userId);

      if (response.success && response.data) {
        if (response.data.onboarding_completed) {
          // 既に登録済み（開発環境）
          toast({
            title: "登録済み",
            description:
              response.message || "販売者登録は既に完了しています",
            status: "info",
            duration: 3000,
            isClosable: true,
          });

          // ステータスを更新
          await checkStatus();
          await getMyProfile();
        } else if (response.data.onboarding_url) {
          // オンボーディングURLにリダイレクト
          toast({
            title: "Stripe登録画面へ移動します",
            description: "銀行口座情報などを登録してください",
            status: "info",
            duration: 2000,
            isClosable: true,
          });

          setTimeout(() => {
            window.location.href = response.data!.onboarding_url!;
          }, 1000);
        }
      } else {
        toast({
          title: "エラー",
          description: response.message || "登録に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Register seller error:", error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Stripeダッシュボードを開く
  const handleOpenDashboard = async () => {
    const userId = memorizeProfile.profile.id;
    if (!userId) return;

    try {
      const response = await getDashboardLink(userId);

      if (response.success && response.data) {
        window.open(response.data.dashboard_url, "_blank");
      } else {
        toast({
          title: "エラー",
          description: response.message || "ダッシュボードを開けませんでした",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Dashboard link error:", error);
    }
  };

  // ローディング中
  if (checkingStatus) {
    return (
      <Box
        bg={bgColor}
        borderRadius="xl"
        p={6}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={3}>
          <Spinner size="sm" />
          <Text>販売者登録状態を確認中...</Text>
        </HStack>
      </Box>
    );
  }

  // 販売者登録済み
  if (accountStatus?.hasAccount && accountStatus?.onboardingCompleted) {
    return (
      <Box
        bg={bgColor}
        borderRadius="xl"
        p={6}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={FaStore} color="green.500" boxSize={5} />
              <Text fontSize="lg" fontWeight="bold">
                販売者登録
              </Text>
            </HStack>
            <Badge colorScheme="green" fontSize="sm">
              登録済み
            </Badge>
          </HStack>

          {accountStatus.isTestMode && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">開発環境モード</AlertTitle>
                <AlertDescription fontSize="xs">
                  テストモードで動作しています
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <Box bg={sectionBg} p={4} borderRadius="md">
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon
                  as={
                    accountStatus.chargesEnabled
                      ? FaCheckCircle
                      : FaExclamationCircle
                  }
                  color={accountStatus.chargesEnabled ? "green.500" : "orange.500"}
                  boxSize={4}
                />
                <Text fontSize="sm">
                  決済受付:{" "}
                  {accountStatus.chargesEnabled ? "有効" : "無効"}
                </Text>
              </HStack>

              <HStack>
                <Icon
                  as={
                    accountStatus.payoutsEnabled
                      ? FaCheckCircle
                      : FaExclamationCircle
                  }
                  color={accountStatus.payoutsEnabled ? "green.500" : "orange.500"}
                  boxSize={4}
                />
                <Text fontSize="sm">
                  出金: {accountStatus.payoutsEnabled ? "有効" : "無効"}
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Text fontSize="sm" color="gray.600">
            販売者として商品を出品し、売上を受け取ることができます。
          </Text>

          {!accountStatus.isTestMode && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<FaExternalLinkAlt />}
              onClick={handleOpenDashboard}
            >
              Stripeダッシュボードを開く
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  // 販売者未登録
  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FaStore} color="gray.400" boxSize={5} />
            <Text fontSize="lg" fontWeight="bold">
              販売者登録
            </Text>
          </HStack>
          <Badge colorScheme="gray" fontSize="sm">
            未登録
          </Badge>
        </HStack>

        <Text fontSize="sm" color="gray.600">
          販売者として登録すると、商品を出品して売上を受け取ることができます。
        </Text>

        <Box bg={sectionBg} p={4} borderRadius="md">
          <VStack align="start" spacing={2} fontSize="sm">
            <Text fontWeight="bold">登録に必要な情報:</Text>
            <Text>• 氏名、住所、生年月日</Text>
            <Text>• 銀行口座情報（売上の受取先）</Text>
            <Text>• 本人確認書類（取引量が増えた場合）</Text>
          </VStack>
        </Box>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertTitle>安全な登録</AlertTitle>
            <AlertDescription>
              銀行口座情報はStripeで暗号化され、安全に管理されます
            </AlertDescription>
          </Box>
        </Alert>

        <Button
          colorScheme="blue"
          size="lg"
          leftIcon={<FaStore />}
          onClick={handleRegisterSeller}
          isLoading={loading}
          loadingText="登録中..."
        >
          販売者として登録する
        </Button>
      </VStack>
    </Box>
  );
};

export default SellerRegistration;
