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
} from "@chakra-ui/react";
import { FaYenSign, FaExchangeAlt } from "react-icons/fa";
import { useState } from "react";
import { proposePurchasePrice } from "../../api/purchaseApi";

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
  const [price, setPrice] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // 購入モードに切り替え可能な条件（Sellerのみ）
  const canSwitchToPurchase =
    tradeType === "exchange" && status === "pending" && !isBuyer;

  const handleProposePurchase = async () => {
    if (!price || Number(price) <= 0) {
      toast({
        title: "エラー",
        description: "有効な金額を入力してください",
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
          <Button
            size="sm"
            colorScheme="orange"
            leftIcon={<FaYenSign />}
            onClick={onOpen}
          >
            購入してもらう（金額を提案）
          </Button>
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

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  希望金額（円）
                </Text>
                <NumberInput
                  min={1}
                  value={price}
                  onChange={(valueString) => setPrice(valueString)}
                >
                  <NumberInputField placeholder="例: 3000" />
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  ※ 購入者負担: 商品代金 + Stripe手数料 3.6%
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

              {price && Number(price) > 0 && (
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontSize="xs" fontWeight="bold" color="green.700" mb={2}>
                    💰 あなたの受取金額
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="green.700">
                        受取金額
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        ¥{Number(price).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                  <Text fontSize="xs" color="gray.600" mt={2}>
                    ※ 購入者は商品代金 + Stripe手数料(3.6%)を支払います
                  </Text>
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
              isDisabled={!price || Number(price) <= 0}
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
