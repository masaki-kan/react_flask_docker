import { FC, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  VStack,
  Text,
  Box,
  HStack,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FaCreditCard, FaLock, FaYenSign, FaStore } from "react-icons/fa";
import { payForPurchase } from "../../api/purchaseApi";
import useMyProfile from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tradeId: number;
  purchasePrice: number;
  onSuccess: () => void;
};

/**
 * 決済モーダル
 * Stripe決済を実行するモーダル（現在はテスト実装）
 */
const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  tradeId,
  purchasePrice,
  onSuccess,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const [isLoading, setIsLoading] = useState(false);

  // 購入者が支払う金額（商品代金のみ）
  const totalAmount = purchasePrice;

  // 販売者登録状態を確認
  const isSellerRegistered = memorizeProfile.profile.stripe_onboarding_completed;

  const handlePayment = async () => {
    // 販売者登録チェック
    if (!isSellerRegistered) {
      toast({
        title: "販売者登録が必要です",
        description: "購入するには、まず販売者として登録する必要があります。プロフィールページから登録してください。",
        status: "warning",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    if (
      !window.confirm(
        `¥${totalAmount.toLocaleString()} の決済を実行しますか？\n（商品代金 + 手数料）`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 実際のStripe決済処理を実装
      // 現在はテスト用のダミー決済
      const result = await payForPurchase({
        trade_id: tradeId,
        payment_method_id: "pm_test_success", // テスト用
      });

      if (result.success) {
        toast({
          title: "決済完了",
          description: "決済が完了しました。商品の発送をお待ちください。",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
        onSuccess();
      } else {
        toast({
          title: "決済エラー",
          description: result.message || "決済に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("決済エラー:", error);
      toast({
        title: "決済エラー",
        description: "決済処理に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaCreditCard} color="blue.500" />
            <Text>決済手続き</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 販売者未登録の警告 */}
            {!isSellerRegistered && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize="sm">販売者登録が必要です</AlertTitle>
                  <AlertDescription fontSize="xs">
                    購入するには、まず販売者として登録する必要があります。
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* セキュリティメッセージ */}
            <Box p={3} bg="blue.50" borderRadius="md">
              <HStack spacing={2}>
                <Icon as={FaLock} color="blue.500" />
                <Text fontSize="xs" color="blue.700">
                  安全な決済システムで保護されています
                </Text>
              </HStack>
            </Box>

            {/* 金額詳細 */}
            <Box>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FaYenSign} color="purple.500" />
                    <Text fontSize="lg" fontWeight="bold">
                      お支払い金額
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    ¥{totalAmount.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* エスクロー説明 */}
            <Box p={3} bg="green.50" borderRadius="md">
              <Text fontSize="xs" fontWeight="bold" color="green.700" mb={1}>
                安心のエスクロー決済
              </Text>
              <Text fontSize="xs" color="gray.600">
                お支払いいただいた金額は、商品を受け取り確認するまでプラットフォームで安全に保管されます。
                <br />
                販売者への送金は、あなたが受け取り確認をした後に行われます。
              </Text>
            </Box>

            {/* テスト決済の注意書き */}
            <Box
              p={3}
              bg="yellow.50"
              borderRadius="md"
              borderWidth={1}
              borderColor="yellow.300"
            >
              <Text fontSize="xs" fontWeight="bold" color="orange.700" mb={1}>
                ⚠️ テスト決済モード
              </Text>
              <Text fontSize="xs" color="gray.600">
                現在はテスト環境です。実際の決済は行われません。
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            キャンセル
          </Button>
          {isSellerRegistered ? (
            <Button
              colorScheme="purple"
              onClick={handlePayment}
              isLoading={isLoading}
              leftIcon={<FaCreditCard />}
            >
              ¥{totalAmount.toLocaleString()} を支払う
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              leftIcon={<FaStore />}
              onClick={() => {
                onClose();
                navigate("/profile");
              }}
            >
              販売者登録へ
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
