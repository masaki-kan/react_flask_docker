import { FC, useState, useEffect } from "react";
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
  Divider,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { FaCreditCard, FaLock, FaYenSign, FaStore, FaUniversity, FaCopy } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  createBankTransferPayment,
  createCardPaymentIntent,
  confirmCardPayment,
  BankTransferInfo,
} from "../../api/purchaseApi";
import useMyProfile from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";

// Stripeの公開キー
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PROMISE_KEY || "");

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tradeId: number;
  purchasePrice: number;
  paymentMethod: "card" | "bank_transfer";
  onSuccess: () => void;
};



// カード入力フォームのスタイル
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
  hidePostalCode: true,
};

// カード決済フォームコンポーネント
const CardPaymentForm: FC<{
  tradeId: number;
  purchasePrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ tradeId, purchasePrice, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  // PaymentIntentを作成
  useEffect(() => {
    const createIntent = async () => {
      try {
        const result = await createCardPaymentIntent({ trade_id: tradeId });
        if (result.success && result.data) {
          setClientSecret(result.data.client_secret);
          setPaymentIntentId(result.data.payment_intent_id);
        } else {
          toast({
            title: "エラー",
            description: result.message || "決済準備に失敗しました",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("PaymentIntent作成エラー:", error);
        toast({
          title: "エラー",
          description: "決済準備に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    createIntent();
  }, [tradeId, toast]);

  const handleSubmit = async () => {
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsLoading(true);
    setCardError(null);

    try {
      // Stripeでカード決済を確定
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error("Stripe決済エラー:", error);
        setCardError(error.message || "カード決済に失敗しました");
        toast({
          title: "決済エラー",
          description: error.message || "カード決済に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // バックエンドに決済完了を通知
        const confirmResult = await confirmCardPayment({
          trade_id: tradeId,
          payment_intent_id: paymentIntentId!,
        });

        if (confirmResult.success) {
          toast({
            title: "決済完了",
            description: "カード決済が完了しました。商品の発送をお待ちください。",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onSuccess();
        } else {
          toast({
            title: "エラー",
            description: confirmResult.message || "決済確認に失敗しました",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("決済処理エラー:", error);
      toast({
        title: "エラー",
        description: "決済処理に失敗しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <VStack py={8}>
        <Spinner size="lg" color="purple.500" />
        <Text>決済を準備中...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* 金額表示 */}
      <Box p={4} bg="purple.50" borderRadius="md">
        <HStack justify="space-between">
          <Text fontWeight="bold">お支払い金額</Text>
          <Text fontSize="2xl" fontWeight="bold" color="purple.600">
            ¥{purchasePrice.toLocaleString()}
          </Text>
        </HStack>
      </Box>

      {/* カード入力フォーム */}
      <Box p={4} bg="gray.50" borderRadius="md" borderWidth={1} borderColor="gray.200">
        <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.700">
          カード情報を入力
        </Text>
        <Box
          p={3}
          bg="white"
          borderRadius="md"
          borderWidth={1}
          borderColor="gray.300"
        >
          <CardElement options={cardElementOptions} />
        </Box>
        {cardError && (
          <Text color="red.500" fontSize="sm" mt={2}>
            {cardError}
          </Text>
        )}
      </Box>

      {/* セキュリティメッセージ */}
      <Box p={3} bg="blue.50" borderRadius="md">
        <HStack spacing={2}>
          <Icon as={FaLock} color="blue.500" />
          <Text fontSize="xs" color="blue.700">
            カード情報はStripeにより安全に処理されます。このサイトにカード番号は保存されません。
          </Text>
        </HStack>
      </Box>

      {/* ボタン */}
      <HStack justify="flex-end" pt={2}>
        <Button variant="ghost" onClick={onCancel} isDisabled={isLoading}>
          戻る
        </Button>
        <Button
          colorScheme="purple"
          onClick={handleSubmit}
          isLoading={isLoading}
          isDisabled={!stripe || !clientSecret}
          leftIcon={<FaCreditCard />}
        >
          ¥{purchasePrice.toLocaleString()} を支払う
        </Button>
      </HStack>
    </VStack>
  );
};

/**
 * 決済モーダル
 * Stripe決済を実行するモーダル（カード決済・銀行振込対応）
 */
const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  tradeId,
  purchasePrice,
  paymentMethod,
  onSuccess,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [bankTransferInfo, setBankTransferInfo] = useState<BankTransferInfo | null>(null);
  const [showBankTransferInfo, setShowBankTransferInfo] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // 購入者が支払う金額（商品代金のみ）
  const totalAmount = purchasePrice;

  // 販売者登録状態を確認
  const isSellerRegistered = memorizeProfile.profile.stripe_onboarding_completed;

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
        const transferInfo = result.data.bank_transfer_info;
        if (transferInfo) {
          setBankTransferInfo(transferInfo);
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
            description: "振込先口座情報を取得できませんでした。しばらくしてから再度お試しください。",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
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
      setShowCardForm(true);
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

  const handleCardSuccess = () => {
    onClose();
    onSuccess();
  };

  // カード入力フォーム表示
  if (showCardForm) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FaCreditCard} color="purple.500" />
              <Text>カード決済</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Elements stripe={stripePromise}>
              <CardPaymentForm
                tradeId={tradeId}
                purchasePrice={totalAmount}
                onSuccess={handleCardSuccess}
                onCancel={() => setShowCardForm(false)}
              />
            </Elements>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

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

            {/* 決済方法（合意済み） */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={3}>
                お支払い方法
              </Text>
              <Box
                p={3}
                borderRadius="md"
                borderWidth={2}
                borderColor={paymentMethod === "card" ? "purple.500" : "blue.500"}
                bg={paymentMethod === "card" ? "purple.50" : "blue.50"}
              >
                <HStack spacing={2}>
                  <Icon
                    as={paymentMethod === "card" ? FaCreditCard : FaUniversity}
                    color={paymentMethod === "card" ? "purple.500" : "blue.500"}
                  />
                  <Text fontWeight="bold">
                    {paymentMethod === "card" ? "クレジットカード" : "銀行振込"}
                  </Text>
                  <Badge
                    colorScheme={paymentMethod === "card" ? "purple" : "blue"}
                    fontSize="xs"
                  >
                    {paymentMethod === "card" ? "即時決済" : "1〜2営業日"}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {paymentMethod === "card"
                    ? "カード情報を入力して即時決済"
                    : "指定口座に振込・入金確認まで1〜2営業日"}
                </Text>
              </Box>
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
                ? "カード情報を入力"
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
