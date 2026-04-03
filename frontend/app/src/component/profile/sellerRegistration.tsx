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
  useDisclosure,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  FaStore,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  createConnectAccount,
  checkAccountStatus,
  getDashboardLink,
  getSellerBalance,
  requestPayout,
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
  const [balance, setBalance] = useState<{
    available: number;
    pending: number;
    payoutFee: number;
  } | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const { isOpen: isPayoutOpen, onOpen: onPayoutOpen, onClose: onPayoutClose } = useDisclosure();

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

  // 残高を取得
  const fetchBalance = useCallback(async () => {
    const userId = memorizeProfile.profile.id;
    if (!userId) return;

    try {
      const response = await getSellerBalance(userId);
      if (response.success && response.data) {
        setBalance({
          available: response.data.available,
          pending: response.data.pending,
          payoutFee: response.data.payout_fee,
        });
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
    }
  }, [memorizeProfile.profile.id]);

  // 振込申請を実行
  const handleRequestPayout = async () => {
    const userId = memorizeProfile.profile.id;
    if (!userId) return;

    setPayoutLoading(true);
    try {
      const response = await requestPayout(userId);

      if (response.success && response.data) {
        toast({
          title: "振込申請完了",
          description: `¥${response.data.amount.toLocaleString()}の振込申請を受け付けました（手数料¥${response.data.fee.toLocaleString()}）`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onPayoutClose();
        // 残高を再取得
        await fetchBalance();
      } else {
        toast({
          title: "振込申請エラー",
          description: response.message || "振込申請に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Payout request error:", error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPayoutLoading(false);
    }
  };

  // 初回ロード時にステータス確認
  useEffect(() => {
    if (memorizeProfile.profile.id) {
      checkStatus();
    }
  }, [memorizeProfile.profile.id, checkStatus]);

  // アカウント登録済みなら残高を取得
  useEffect(() => {
    if (accountStatus?.hasAccount && accountStatus?.onboardingCompleted) {
      fetchBalance();
    }
  }, [accountStatus, fetchBalance]);

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
        if (response.data.onboarding_completed || response.data.is_test_mode) {
          // 登録完了（開発環境またはテストモード）
          toast({
            title: response.data.is_test_mode ? "販売者登録完了（テストモード）" : "登録済み",
            description:
              response.message || response.data.is_test_mode
                ? "テスト環境のため、すぐに登録が完了しました"
                : "販売者登録は既に完了しています",
            status: "success",
            duration: 4000,
            isClosable: true,
          });

          // ステータスを更新
          await checkStatus();
          await getMyProfile();
        } else if (response.data.onboarding_url) {
          // オンボーディングURLにリダイレクト（本番環境）
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

          {/* 残高・振込セクション */}
          {balance && (
            <>
              <Divider />
              <Box bg={sectionBg} p={4} borderRadius="md">
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="bold" fontSize="sm">
                    売上残高
                  </Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      振込可能残高
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      ¥{balance.available.toLocaleString()}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      保留中残高
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      ¥{balance.pending.toLocaleString()}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    ※ 売上残高への反映には決済完了から約4営業日かかります。
                  </Text>
                </VStack>
              </Box>

              <Button
                colorScheme="green"
                size="md"
                leftIcon={<FaMoneyBillWave />}
                onClick={onPayoutOpen}
                isDisabled={balance.available < balance.payoutFee + 1}
              >
                振込申請する（手数料¥{balance.payoutFee.toLocaleString()}）
              </Button>

              {balance.available < balance.payoutFee + 1 && (
                <Text fontSize="xs" color="gray.500">
                  ※ 振込には¥{(balance.payoutFee + 1).toLocaleString()}以上の残高が必要です
                </Text>
              )}
            </>
          )}

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

        {/* 振込確認ダイアログ */}
        <Modal isOpen={isPayoutOpen} onClose={onPayoutClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>振込申請の確認</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text color="gray.600">振込可能残高</Text>
                  <Text fontWeight="bold">
                    ¥{balance?.available.toLocaleString()}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">振込手数料</Text>
                  <Text color="red.500">
                    -¥{balance?.payoutFee.toLocaleString()}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold">振込金額</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    ¥{balance ? (balance.available - balance.payoutFee).toLocaleString() : 0}
                  </Text>
                </HStack>
                <Alert status="info" borderRadius="md" mt={2}>
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    振込は通常1〜2営業日で銀行口座に入金されます
                  </AlertDescription>
                </Alert>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPayoutClose}>
                キャンセル
              </Button>
              <Button
                colorScheme="green"
                onClick={handleRequestPayout}
                isLoading={payoutLoading}
                loadingText="申請中..."
              >
                振込を申請する
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
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
