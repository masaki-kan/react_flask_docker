import { FC, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { completePurchaseTrade } from "../../api/purchaseApi";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

type PurchaseCompleteButtonProps = {
  tradeId: number;
  isBuyerConfirmed: boolean;
  purchasePrice: number;
  paymentMethod: "card" | "bank_transfer";
};

/**
 * 購入取引完了ボタンコンポーネント
 * Sellerが購入取引を完了し、代金を受け取る
 */
const PurchaseCompleteButton: FC<PurchaseCompleteButtonProps> = ({
  tradeId,
  isBuyerConfirmed,
  purchasePrice,
  paymentMethod,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 手数料計算（カード: 3.6%、銀行振込: 1.5%）
  const feeRate = paymentMethod === "card" ? 0.036 : 0.015;
  const processingFee = Math.floor(purchasePrice * feeRate);
  const netAmount = purchasePrice - processingFee;

  const handleCompletePurchase = async () => {
    const feeRateLabel = paymentMethod === "card" ? "3.6%" : "1.5%";
    const confirm = window.confirm(
      `取引を完了しますか？\n\n購入金額: ¥${purchasePrice.toLocaleString()}\n決済手数料 (${feeRateLabel}): -¥${processingFee.toLocaleString()}\nあなたの受取金額: ¥${netAmount.toLocaleString()}\n\n完了後は取引履歴に保存されます。`
    );

    if (!confirm) return;

    setIsLoading(true);
    try {
      const result = await completePurchaseTrade({
        trade_id: tradeId,
      });

      if (result.success) {
        toast({
          title: "取引完了",
          description: "購入取引が完了しました",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        setTimeout(() => {
          navigate(route.saved);
        }, 1000);
      } else {
        toast({
          title: "エラー",
          description: result.message || "取引完了に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("取引完了エラー:", error);
      toast({
        title: "エラー",
        description: "取引完了に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      mt={3}
      p={4}
      bg="green.50"
      borderRadius="md"
      borderWidth={2}
      borderColor="green.200"
    >
      <VStack align="stretch" spacing={3}>
        <HStack>
          <Icon as={FaMoneyBillWave} color="green.500" boxSize={5} />
          <Text fontSize="md" fontWeight="bold" color="green.700">
            取引完了
          </Text>
        </HStack>

        {!isBuyerConfirmed ? (
          <Box p={3} bg="yellow.50" borderRadius="md">
            <HStack>
              <Icon as={FaCheckCircle} color="orange.400" />
              <Text fontSize="sm" color="gray.700">
                購入者の受取確認をお待ちください
              </Text>
            </HStack>
          </Box>
        ) : (
          <VStack align="stretch" spacing={3}>
            <HStack spacing={2}>
              <Icon as={FaCheckCircle} color="green.500" />
              <Text fontSize="sm" color="green.700">
                購入者が受取を確認しました
              </Text>
            </HStack>

            <Box p={3} bg="white" borderRadius="md">
              <VStack align="stretch" spacing={1}>
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.600">
                    購入金額
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    ¥{purchasePrice.toLocaleString()}
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
                    あなたの受取金額
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    ¥{netAmount.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Button
              colorScheme="green"
              onClick={handleCompletePurchase}
              isLoading={isLoading}
              leftIcon={<FaCheckCircle />}
            >
              取引を完了する
            </Button>
            {/* 
            <Text fontSize="xs" color="gray.500">
              ※ 取引完了後、受取金額がアカウントに反映されます
            </Text> */}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default PurchaseCompleteButton;
