import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Box,
  List,
  ListItem,
  ListIcon,
  useDisclosure,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { MdWarning, MdCancel, MdCheckCircle } from "react-icons/md";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getSubscriptionInfo, withdrawalApi } from "../../api/creditApi";
import { useAuth } from "../../provider/authContext";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  subscriptionType?: "monthly" | "yearly";
  nextBillingDate?: string;
  isTrialing?: boolean;
  trialEndDate?: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscriptionType = "monthly",
  nextBillingDate,
  isTrialing = false,
  trialEndDate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"confirm" | "final">("confirm");

  const handleFirstConfirm = () => {
    setStep("final");
  };

  const handleFinalConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("退会処理エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const subscriptionInfo =
    subscriptionType === "monthly" ? "月額500円プラン" : "年額5,500円プラン";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        {step === "confirm" ? (
          <>
            <ModalHeader>
              <HStack>
                <FaExclamationTriangle color="orange" />
                <Text>退会手続きの確認</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>本当に退会しますか？</AlertTitle>
                    <AlertDescription fontSize="sm" mt={2}>
                      退会すると以下の内容がすべて削除されます
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box bg="gray.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={3}>
                    削除される内容
                  </Text>
                  <List spacing={2}>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      出品中のアイテム情報
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      交換履歴
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      お気に入り・保存したアイテム
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      プロフィール情報
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box bg="blue.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    サブスクリプション情報
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">
                      現在のプラン: <strong>{subscriptionInfo}</strong>
                    </Text>
                    {isTrialing && trialEndDate && (
                      <>
                        <Text fontSize="sm" color="green.600">
                          無料トライアル期間中
                        </Text>
                        <Text fontSize="sm">
                          トライアル終了日: {formatDate(trialEndDate)}
                        </Text>
                      </>
                    )}
                    {!isTrialing && nextBillingDate && (
                      <Text fontSize="sm">
                        サービス利用可能期限: {formatDate(nextBillingDate)}
                      </Text>
                    )}
                    <Text
                      fontSize="sm"
                      color="red.600"
                      fontWeight="medium"
                      mt={2}
                    >
                      ※ {isTrialing ? "無料期間終了時" : "期間満了時"}
                      に自動的にサービスが終了します
                    </Text>
                  </VStack>
                </Box>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    {isTrialing
                      ? "無料トライアル期間中のため、料金は発生しません。"
                      : "お支払い済みの期間までサービスをご利用いただけます。"}
                    退会後も同じメールアドレスで再登録が可能ですが、
                    削除されたデータは復元できません。
                  </Text>
                </Alert>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={handleFirstConfirm}>
                退会手続きを進める
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>
              <HStack>
                <MdWarning color="red" />
                <Text color="red.600">最終確認</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>この操作は取り消せません</AlertTitle>
                    <AlertDescription fontSize="sm" mt={2}>
                      本当に退会してもよろしいですか？
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box textAlign="center" py={4}>
                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                    すべてのデータが完全に削除されます
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    この操作を実行すると、アカウントとすべての関連データが
                    即座に削除され、復元することはできません。
                  </Text>
                </Box>

                <Box
                  bg="red.50"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="red.200"
                >
                  <Text fontSize="sm" fontWeight="medium" color="red.700">
                    確認事項：
                  </Text>
                  <List spacing={1} mt={2}>
                    <ListItem fontSize="sm" color="red.700">
                      <ListIcon as={MdCheckCircle} color="red.500" />
                      データの削除について理解しました
                    </ListItem>
                    <ListItem fontSize="sm" color="red.700">
                      <ListIcon as={MdCheckCircle} color="red.500" />
                      サブスクリプションが解約されることを理解しました
                    </ListItem>
                    <ListItem fontSize="sm" color="red.700">
                      <ListIcon as={MdCheckCircle} color="red.500" />
                      この操作は取り消せないことを理解しました
                    </ListItem>
                  </List>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr={3} onClick={handleClose}>
                やめる
              </Button>
              <Button
                colorScheme="red"
                onClick={handleFinalConfirm}
                isLoading={isLoading}
                loadingText="退会処理中..."
              >
                退会する
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// 退会ボタンコンポーネント
export const WithdrawalButton: React.FC = () => {
  const { memorizeProfile } = useMyProfile();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    cancel_at_period_end: boolean;
    current_period_end: number;
    days_until_trial_end: number;
    has_subscription: boolean;
    plan_type: "monthly" | "yearly" | undefined;
    status: string;
    trial_end: number;
  } | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();

  // サブスクリプション情報を取得
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      setIsLoadingInfo(true);
      try {
        const info = await getSubscriptionInfo(memorizeProfile.profile.id);
        setSubscriptionInfo(info);
      } catch (error) {
        console.error("サブスクリプション情報の取得に失敗:", error);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    if (isOpen) {
      fetchSubscriptionInfo();
    }
  }, [isOpen, memorizeProfile.profile.id]);

  const handleWithdrawal = async () => {
    const result = await withdrawalApi(memorizeProfile.profile.id);

    if (result?.result) {
      toast({
        title: "退会完了",
        description: "退会処理が完了しました。ご利用ありがとうございました。",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // ログアウト処理
      logout();

      // トップページへリダイレクト
      setTimeout(() => {
        navigate(route.top);
      }, 1000);
    } else {
      toast({
        title: "エラー",
        description: "退会処理に失敗しました。時間をおいて再度お試しください。",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    }
  };

  // 次回請求日を計算
  const getNextBillingDate = () => {
    if (!subscriptionInfo) return undefined;

    if (subscriptionInfo.current_period_end) {
      return new Date(subscriptionInfo.current_period_end * 1000).toISOString();
    }
    return undefined;
  };

  // トライアル終了日を取得
  const getTrialEndDate = () => {
    if (!subscriptionInfo) return undefined;

    if (subscriptionInfo.trial_end) {
      return new Date(subscriptionInfo.trial_end * 1000).toISOString();
    }
    return undefined;
  };

  return (
    <>
      <Button
        colorScheme="red"
        variant="outline"
        size="sm"
        onClick={onOpen}
        isLoading={isLoadingInfo}
      >
        退会する
      </Button>

      <WithdrawalModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleWithdrawal}
        subscriptionType={subscriptionInfo?.plan_type || "monthly"}
        nextBillingDate={getNextBillingDate()}
        isTrialing={subscriptionInfo?.status === "trialing"}
        trialEndDate={getTrialEndDate()}
      />
    </>
  );
};

export default WithdrawalButton;
