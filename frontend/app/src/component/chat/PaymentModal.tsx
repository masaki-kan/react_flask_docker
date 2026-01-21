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
  RadioGroup,
  Radio,
  Stack,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { FaCreditCard, FaLock, FaYenSign, FaStore, FaUniversity, FaCopy } from "react-icons/fa";
import { payForPurchase, createBankTransferPayment, BankTransferInfo } from "../../api/purchaseApi";
import useMyProfile from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tradeId: number;
  purchasePrice: number;
  onSuccess: () => void;
};

type PaymentMethod = "card" | "bank_transfer";

/**
 * 決済モーダル
 * Stripe決済を実行するモーダル（カード決済・銀行振込対応）
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [bankTransferInfo, setBankTransferInfo] = useState<BankTransferInfo | null>(null);
  const [showBankTransferInfo, setShowBankTransferInfo] = useState(false);

  // 購入者が支払う金額（商品代金のみ）
  const totalAmount = purchasePrice;

  // 販売者登録状態を確認
  const isSellerRegistered = memorizeProfile.profile.stripe_onboarding_completed;

  const handleCardPayment = async () => {
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
        `¥${totalAmount.toLocaleString()} のカード決済を実行しますか？`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await payForPurchase({
        trade_id: tradeId,
        payment_method_id: "pm_test_success",
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

  const handleBankTransferPayment = async () => {
    if (!isSellerRegistered) {
      toast({
        title: "販売者登録が必要です",
        description: "購入するには、まず販売者として登録する必要があります。",
        status: "warning",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createBankTransferPayment({
        trade_id: tradeId,
      });

      if (result.success && result.data) {
        setBankTransferInfo(result.data.bank_transfer_info || null);
        setShowBankTransferInfo(true);
        toast({
          title: "振込先情報を取得しました",
          description: "下記の口座に振り込んでください。",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "エラー",
          description: result.message || "銀行振込情報の取得に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("銀行振込エラー:", error);
      toast({
        title: "エラー",
        description: "銀行振込情報の取得に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "card") {
      handleCardPayment();
    } else {
      handleBankTransferPayment();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label}をコピーしました`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleBankTransferComplete = () => {
    toast({
      title: "振込手続きを開始しました",
      description: "入金が確認され次第、取引が進行します。",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    onClose();
    onSuccess();
  };

  // 銀行振込情報表示画面
  if (showBankTransferInfo && bankTransferInfo) {
    const zenginInfo = bankTransferInfo.financial_addresses?.[0]?.zengin;

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FaUniversity} color="blue.500" />
              <Text>銀行振込先情報</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* 振込金額 */}
              <Box p={4} bg="purple.50" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontWeight="bold">振込金額</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    ¥{bankTransferInfo.amount_remaining.toLocaleString()}
                  </Text>
                </HStack>
              </Box>

              {/* 振込先口座情報 */}
              {zenginInfo && (
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="gray.700">
                    振込先口座
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">銀行名</Text>
                      <HStack>
                        <Text fontSize="sm" fontWeight="bold">{zenginInfo.bank_name}</Text>
                        <Icon
                          as={FaCopy}
                          color="gray.400"
                          cursor="pointer"
                          onClick={() => copyToClipboard(zenginInfo.bank_name, "銀行名")}
                        />
                      </HStack>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">支店名</Text>
                      <HStack>
                        <Text fontSize="sm" fontWeight="bold">{zenginInfo.branch_name}</Text>
                        <Icon
                          as={FaCopy}
                          color="gray.400"
                          cursor="pointer"
                          onClick={() => copyToClipboard(zenginInfo.branch_name, "支店名")}
                        />
                      </HStack>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">口座種別</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {zenginInfo.account_type === "futsu" ? "普通" : zenginInfo.account_type}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">口座番号</Text>
                      <HStack>
                        <Text fontSize="sm" fontWeight="bold">{zenginInfo.account_number}</Text>
                        <Icon
                          as={FaCopy}
                          color="gray.400"
                          cursor="pointer"
                          onClick={() => copyToClipboard(zenginInfo.account_number, "口座番号")}
                        />
                      </HStack>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">口座名義</Text>
                      <HStack>
                        <Text fontSize="sm" fontWeight="bold">{zenginInfo.account_holder_name}</Text>
                        <Icon
                          as={FaCopy}
                          color="gray.400"
                          cursor="pointer"
                          onClick={() => copyToClipboard(zenginInfo.account_holder_name, "口座名義")}
                        />
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* 振込依頼人名 */}
              {bankTransferInfo.reference && (
                <Box p={3} bg="orange.50" borderRadius="md" borderWidth={1} borderColor="orange.300">
                  <Text fontSize="xs" fontWeight="bold" color="orange.700" mb={1}>
                    振込依頼人名に必ず以下を入力してください
                  </Text>
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="lg" fontWeight="bold" color="orange.800">
                      {bankTransferInfo.reference}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      variant="outline"
                      leftIcon={<FaCopy />}
                      onClick={() => copyToClipboard(bankTransferInfo.reference!, "振込依頼人名")}
                    >
                      コピー
                    </Button>
                  </HStack>
                </Box>
              )}

              {/* 注意事項 */}
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="xs" fontWeight="bold" color="blue.700" mb={1}>
                  ご注意
                </Text>
                <Text fontSize="xs" color="gray.600">
                  ・振込手数料はお客様のご負担となります
                  <br />
                  ・入金確認まで1〜2営業日かかる場合があります
                  <br />
                  ・入金が確認され次第、取引が進行します
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setShowBankTransferInfo(false)}>
              戻る
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBankTransferComplete}
            >
              振込手続きを開始する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

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

            <Divider />

            {/* 支払い方法選択 */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={3}>
                お支払い方法を選択
              </Text>
              <RadioGroup value={paymentMethod} onChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                <Stack spacing={3}>
                  {/* カード決済 */}
                  <Box
                    p={3}
                    borderRadius="md"
                    borderWidth={2}
                    borderColor={paymentMethod === "card" ? "purple.500" : "gray.200"}
                    bg={paymentMethod === "card" ? "purple.50" : "white"}
                    cursor="pointer"
                    onClick={() => setPaymentMethod("card")}
                  >
                    <Radio value="card" colorScheme="purple">
                      <HStack spacing={2}>
                        <Icon as={FaCreditCard} color="purple.500" />
                        <Text fontWeight="bold">クレジットカード</Text>
                        <Badge colorScheme="purple" fontSize="xs">即時決済</Badge>
                      </HStack>
                    </Radio>
                    <Text fontSize="xs" color="gray.500" ml={6} mt={1}>
                      決済手数料 3.6%（販売者負担）
                    </Text>
                  </Box>

                  {/* 銀行振込 */}
                  <Box
                    p={3}
                    borderRadius="md"
                    borderWidth={2}
                    borderColor={paymentMethod === "bank_transfer" ? "blue.500" : "gray.200"}
                    bg={paymentMethod === "bank_transfer" ? "blue.50" : "white"}
                    cursor="pointer"
                    onClick={() => setPaymentMethod("bank_transfer")}
                  >
                    <Radio value="bank_transfer" colorScheme="blue">
                      <HStack spacing={2}>
                        <Icon as={FaUniversity} color="blue.500" />
                        <Text fontWeight="bold">銀行振込</Text>
                        <Badge colorScheme="blue" fontSize="xs">1〜2営業日</Badge>
                      </HStack>
                    </Radio>
                    <Text fontSize="xs" color="gray.500" ml={6} mt={1}>
                      決済手数料 1.5%（販売者負担）・振込手数料はお客様負担
                    </Text>
                  </Box>
                </Stack>
              </RadioGroup>
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
                テスト決済モード
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
              colorScheme={paymentMethod === "card" ? "purple" : "blue"}
              onClick={handlePayment}
              isLoading={isLoading}
              leftIcon={paymentMethod === "card" ? <FaCreditCard /> : <FaUniversity />}
            >
              {paymentMethod === "card"
                ? `¥${totalAmount.toLocaleString()} を支払う`
                : "振込先情報を表示"}
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
