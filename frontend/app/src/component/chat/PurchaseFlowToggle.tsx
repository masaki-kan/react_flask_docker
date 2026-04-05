import { FC } from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
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
  useToast,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { FaYenSign, FaExchangeAlt, FaCreditCard, FaUniversity, FaStore } from "react-icons/fa";
import { useState } from "react";
import { proposePurchasePrice } from "../../api/purchaseApi";
import useMyProfile from "../../hooks/useProfile";
import { TRADE_STATUS } from "../../constants/tradeStatus";
import { useNavigate } from "react-router-dom";

type PurchaseFlowToggleProps = {
  tradeId: number;
  tradeType: "exchange" | "purchase";
  status: string;
  isBuyer: boolean;
  onSuccess: () => void;
};

/**
 * 購入フロー切り替えコンポーネント
 * 申請された側（Seller）が交換商品がない場合に「購入モード」を提案できる
 */
const PurchaseFlowToggle: FC<PurchaseFlowToggleProps> = ({
  tradeId,
  tradeType,
  status,
  isBuyer,
  onSuccess,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const [price, setPrice] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");

  // 販売者登録状態を確認
  const isSellerRegistered = memorizeProfile.profile.stripe_onboarding_completed;

  // 購入モードに切り替え可能な条件（Sellerのみ）
  const canSwitchToPurchase =
    tradeType === "exchange" && status === TRADE_STATUS.PENDING && !isBuyer;

  // 手数料計算（カード: 3.6%、銀行振込: 1.5%）
  const priceNum = Number(price) || 0;
  const feeRate = paymentMethod === "card" ? 0.036 : 0.015;
  const processingFee = Math.floor(priceNum * feeRate);
  const netAmount = priceNum - processingFee;

  const MIN_PRICE = 300;

  const handleProposePurchase = async () => {
    if (!price || Number(price) < MIN_PRICE) {
      toast({
        title: "エラー",
        description: `金額は${MIN_PRICE}円以上で入力してください`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await proposePurchasePrice({
        trade_id: tradeId,
        price: Number(price),
        message: message || undefined,
        payment_method: paymentMethod,
      });

      if (result.success) {
        toast({
          title: "購入提案完了",
          description: `¥${Number(price).toLocaleString()}で購入提案しました`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        onSuccess();
      } else {
        toast({
          title: "エラー",
          description: result.message || "購入提案に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("購入提案エラー:", error);
      toast({
        title: "エラー",
        description: "購入提案に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canSwitchToPurchase) {
    return null;
  }

  return (
    <>
      <Box mt={3} p={3} bg="orange.50" borderRadius="md">
        <VStack align="stretch" spacing={2}>
          <HStack>
            <Icon as={FaExchangeAlt} color="orange.500" />
            <Text fontSize="sm" fontWeight="bold" color="orange.700">
              交換商品がない場合
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.600">
            交換する商品がない場合、相手に購入してもらうことができます。
            <br />
            希望金額を提案してください。
          </Text>
          {isSellerRegistered ? (
            <Button
              size="sm"
              colorScheme="orange"
              leftIcon={<FaYenSign />}
              onClick={onOpen}
            >
              購入してもらう（金額を提案）
            </Button>
          ) : (
            <VStack spacing={2} align="stretch">
              <Box p={2} bg="red.50" borderRadius="md" borderWidth={1} borderColor="red.200">
                <Text fontSize="xs" color="red.600">
                  金額を提案するには、販売者登録（Stripe連携）が必要です。
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FaStore />}
                onClick={() => navigate("/profile")}
              >
                販売者登録へ
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* 金額提案モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>購入希望金額を提案</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="xs" color="blue.700">
                  相手に購入してもらう場合の希望金額を入力してください。
                  <br />
                  相手が金額に同意すると、決済が行われます。
                </Text>
              </Box>

              {/* 決済方法選択 */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  決済方法
                </Text>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val as "card" | "bank_transfer")}
                >
                  <Stack spacing={3}>
                    <Box
                      p={3}
                      borderRadius="md"
                      borderWidth={2}
                      borderColor={paymentMethod === "card" ? "blue.400" : "gray.200"}
                      bg={paymentMethod === "card" ? "blue.50" : "white"}
                      cursor="pointer"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <Radio value="card" colorScheme="blue">
                        <HStack spacing={2}>
                          <Icon as={FaCreditCard} color="blue.500" />
                          <Text fontSize="sm" fontWeight="bold">カード決済</Text>
                        </HStack>
                      </Radio>
                      <Text fontSize="xs" color="gray.600" ml={6} mt={1}>
                        決済手数料 3.6%（販売者負担）
                      </Text>
                    </Box>
                    <Box
                      p={3}
                      borderRadius="md"
                      borderWidth={2}
                      borderColor={paymentMethod === "bank_transfer" ? "blue.400" : "gray.200"}
                      bg={paymentMethod === "bank_transfer" ? "blue.50" : "white"}
                      cursor="pointer"
                      onClick={() => setPaymentMethod("bank_transfer")}
                    >
                      <Radio value="bank_transfer" colorScheme="blue">
                        <HStack spacing={2}>
                          <Icon as={FaUniversity} color="green.600" />
                          <Text fontSize="sm" fontWeight="bold">銀行振込</Text>
                        </HStack>
                      </Radio>
                      <Text fontSize="xs" color="gray.600" ml={6} mt={1}>
                        決済手数料 1.5%（販売者負担）
                      </Text>
                    </Box>
                  </Stack>
                </RadioGroup>
              </Box>

              {/* 手数料説明 */}
              <Box p={3} bg="orange.50" borderRadius="md" borderWidth={1} borderColor="orange.300">
                <Text fontSize="xs" fontWeight="bold" color="orange.700" mb={1}>
                  💡 手数料について
                </Text>
                <Text fontSize="xs" color="gray.700">
                  以下の手数料は販売者負担となります。
                  <br />
                  ・決済手数料（{paymentMethod === "card" ? "3.6%" : "1.5%"}）
                  <br />
                  購入者から受け取った金額から手数料が差し引かれた金額が振り込まれます。
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  希望金額（円）
                </Text>
                <NumberInput
                  min={MIN_PRICE}
                  value={price}
                  onChange={(valueString) => setPrice(valueString)}
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
                  placeholder="相手へのメッセージを入力できます"
                  rows={3}
                  maxLength={500}
                />
              </Box>

              {price && priceNum > 0 && (
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
                        ¥{priceNum.toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.600">
                        決済手数料 ({paymentMethod === "card" ? "3.6%" : "1.5%"})
                      </Text>
                      <Text fontSize="xs" color="red.500">
                        -¥{processingFee.toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" pt={1} borderTopWidth={1} borderColor="gray.300">
                      <Text fontSize="sm" fontWeight="bold" color="green.700">
                        銀行口座への振込額
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        ¥{netAmount.toLocaleString()}
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
              onClick={handleProposePurchase}
              isLoading={isLoading}
              isDisabled={!price || Number(price) < MIN_PRICE}
            >
              金額を提案
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PurchaseFlowToggle;
