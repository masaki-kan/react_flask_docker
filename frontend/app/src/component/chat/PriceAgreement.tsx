import { FC, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  NumberInput,
  NumberInputField,
  Textarea,
} from "@chakra-ui/react";
import { FaCheckCircle, FaYenSign, FaHourglassHalf, FaEdit, FaCreditCard, FaUniversity } from "react-icons/fa";
import { agreePurchasePrice, proposePurchasePrice } from "../../api/purchaseApi";

type PriceAgreementProps = {
  tradeId: number;
  purchasePrice: number;
  isPriceAgreedSeller: boolean;
  isPriceAgreedBuyer: boolean;
  isSeller: boolean;
  status: string;
  paymentMethod: "card" | "bank_transfer";
  onSuccess: () => void;
};

/**
 * 金額合意コンポーネント
 * 提案された金額に対して、SellerとBuyerが合意するUI
 */
const PriceAgreement: FC<PriceAgreementProps> = ({
  tradeId,
  purchasePrice,
  isPriceAgreedSeller,
  isPriceAgreedBuyer,
  isSeller,
  status,
  paymentMethod,
  onSuccess,
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newPrice, setNewPrice] = useState<string>(purchasePrice.toString());
  const [message, setMessage] = useState<string>("");
  const [isEditLoading, setIsEditLoading] = useState(false);

  // 表示条件: 金額が提案されているか、既に合意済み
  if (status !== "price_proposed" && status !== "price_agreed") {
    return null;
  }

  // 現在のユーザーが既に合意済みかチェック
  const hasUserAgreed = isSeller ? isPriceAgreedSeller : isPriceAgreedBuyer;
  const hasPartnerAgreed = isSeller ? isPriceAgreedBuyer : isPriceAgreedSeller;

  // 両者が合意済み
  const bothAgreed = isPriceAgreedSeller && isPriceAgreedBuyer;

  const handleAgree = async () => {
    const confirmMessage = isSeller
      ? `提案した金額 ¥${purchasePrice.toLocaleString()} で販売しますか？\n\n⚠️ 注意: 金額に合意すると、取引をキャンセルすることができなくなります。`
      : `¥${purchasePrice.toLocaleString()} で購入しますか？\n\n⚠️ 注意: 金額に合意すると、取引をキャンセルすることができなくなります。`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await agreePurchasePrice({
        trade_id: tradeId,
        user_type: isSeller ? "seller" : "buyer",
      });

      if (result.success) {
        toast({
          title: "合意完了",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
      } else {
        toast({
          title: "エラー",
          description: result.message || "合意処理に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("金額合意エラー:", error);
      toast({
        title: "エラー",
        description: "合意処理に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const MIN_PRICE = 300;

  // 金額修正ハンドラー
  const handleEditPrice = async () => {
    if (!newPrice || Number(newPrice) < MIN_PRICE) {
      toast({
        title: "エラー",
        description: `金額は${MIN_PRICE}円以上で入力してください`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsEditLoading(true);
    try {
      const result = await proposePurchasePrice({
        trade_id: tradeId,
        price: Number(newPrice),
        message: message || undefined,
      });

      if (result.success) {
        toast({
          title: "金額を修正しました",
          description: `新しい金額: ¥${Number(newPrice).toLocaleString()}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setMessage("");
        onSuccess();
      } else {
        toast({
          title: "エラー",
          description: result.message || "金額の修正に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("金額修正エラー:", error);
      toast({
        title: "エラー",
        description: "金額の修正に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  return (
    <Box mt={3} p={4} bg="purple.50" borderRadius="md" borderWidth={2} borderColor="purple.200">
      <VStack align="stretch" spacing={3}>
        {/* タイトル */}
        <HStack>
          <Icon as={FaYenSign} color="purple.500" boxSize={5} />
          <Text fontSize="md" fontWeight="bold" color="purple.700">
            購入金額の確認
          </Text>
        </HStack>

        {/* 提案金額 */}
        <Box p={3} bg="white" borderRadius="md">
          <Text fontSize="xs" color="gray.600" mb={1}>
            提案金額
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="purple.600">
            ¥{purchasePrice.toLocaleString()}
          </Text>
        </Box>

        {/* 決済方法 */}
        <Box p={3} bg="white" borderRadius="md">
          <Text fontSize="xs" color="gray.600" mb={1}>
            決済方法
          </Text>
          <HStack spacing={2}>
            <Icon
              as={paymentMethod === "card" ? FaCreditCard : FaUniversity}
              color={paymentMethod === "card" ? "purple.500" : "blue.500"}
            />
            <Text fontSize="sm" fontWeight="bold">
              {paymentMethod === "card" ? "クレジットカード" : "銀行振込"}
            </Text>
          </HStack>
        </Box>

        {/* 合意状況 */}
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <HStack>
              <Icon
                as={isPriceAgreedSeller ? FaCheckCircle : FaHourglassHalf}
                color={isPriceAgreedSeller ? "green.500" : "gray.400"}
              />
              <Text fontSize="sm">
                出品者: {isPriceAgreedSeller ? "合意済み" : "確認中"}
              </Text>
            </HStack>
          </HStack>

          <HStack justify="space-between">
            <HStack>
              <Icon
                as={isPriceAgreedBuyer ? FaCheckCircle : FaHourglassHalf}
                color={isPriceAgreedBuyer ? "green.500" : "gray.400"}
              />
              <Text fontSize="sm">
                購入者: {isPriceAgreedBuyer ? "合意済み" : "確認中"}
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* アクションボタン */}
        {!bothAgreed && (
          <>
            {!hasUserAgreed ? (
              <VStack spacing={2}>
                <Button
                  colorScheme="purple"
                  onClick={handleAgree}
                  isLoading={isLoading}
                  leftIcon={<FaCheckCircle />}
                  width="100%"
                >
                  {isSeller ? "この金額で販売する" : "この金額で購入する"}
                </Button>
                {/* Sellerのみ金額修正ボタンを表示 */}
                {isSeller && (
                  <Button
                    variant="outline"
                    colorScheme="orange"
                    onClick={onOpen}
                    leftIcon={<FaEdit />}
                    width="100%"
                    size="sm"
                  >
                    金額を修正する
                  </Button>
                )}
              </VStack>
            ) : (
              <Box p={3} bg="green.50" borderRadius="md">
                <HStack>
                  <Icon as={FaCheckCircle} color="green.500" />
                  <Text fontSize="sm" color="green.700">
                    あなたは合意済みです
                  </Text>
                </HStack>
                {!hasPartnerAgreed && (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    相手の合意をお待ちください
                  </Text>
                )}
              </Box>
            )}
          </>
        )}

        {/* 両者合意完了 */}
        {bothAgreed && (
          <Box p={3} bg="green.50" borderRadius="md" borderWidth={1} borderColor="green.200">
            <HStack>
              <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="green.700">
                  金額が確定しました
                </Text>
                <Text fontSize="xs" color="gray.600">
                  決済を進めてください
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </VStack>

      {/* 金額修正モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>購入金額を修正</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box p={3} bg="orange.50" borderRadius="md">
                <Text fontSize="xs" color="orange.700" fontWeight="bold" mb={1}>
                  ⚠️ 注意
                </Text>
                <Text fontSize="xs" color="gray.600">
                  金額を修正すると、相手の合意状態がリセットされます。
                  <br />
                  両者が再度合意する必要があります。
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  現在の金額
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="gray.600">
                  ¥{purchasePrice.toLocaleString()}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  新しい金額（円）
                </Text>
                <NumberInput
                  min={MIN_PRICE}
                  value={newPrice}
                  onChange={(valueString) => setNewPrice(valueString)}
                >
                  <NumberInputField placeholder="例: 3000" />
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  ※ 最低金額: {MIN_PRICE}円
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  メッセージ（任意）
                </Text>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="金額修正の理由などを入力できます"
                  rows={3}
                  maxLength={500}
                />
              </Box>

              {newPrice && Number(newPrice) > 0 && (
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontSize="xs" fontWeight="bold" color="green.700" mb={2}>
                    💰 あなたの受取金額
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.600">
                        提示金額
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        ¥{Number(newPrice).toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.600">
                        決済手数料 ({paymentMethod === "card" ? "3.6%" : "1.5%"})
                      </Text>
                      <Text fontSize="xs" color="red.500">
                        -¥{Math.floor(Number(newPrice) * (paymentMethod === "card" ? 0.036 : 0.015)).toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" pt={1} borderTopWidth={1} borderColor="gray.300">
                      <Text fontSize="sm" fontWeight="bold" color="green.700">
                        銀行口座への振込額
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        ¥{(Number(newPrice) - Math.floor(Number(newPrice) * (paymentMethod === "card" ? 0.036 : 0.015))).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleEditPrice}
              isLoading={isEditLoading}
              isDisabled={!newPrice || Number(newPrice) < MIN_PRICE}
            >
              金額を修正
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PriceAgreement;
