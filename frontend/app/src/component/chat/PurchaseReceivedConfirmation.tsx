import { FC, useState } from "react";
import {
  Box,
  Checkbox,
  HStack,
  Icon,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { FaCheckCircle, FaBox } from "react-icons/fa";
import { confirmBuyerReceived } from "../../api/purchaseApi";

type PurchaseReceivedConfirmationProps = {
  tradeId: number;
  isBuyerConfirmed: boolean;
  onSuccess: () => void;
};

/**
 * 購入商品受取確認コンポーネント
 * Buyerが商品を受け取ったことを確認する
 */
const PurchaseReceivedConfirmation: FC<PurchaseReceivedConfirmationProps> = ({
  tradeId,
  isBuyerConfirmed,
  onSuccess,
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmReceived = async (checked: boolean) => {
    if (!checked) return;

    const confirm = window.confirm(
      "商品を受け取りましたか？\n\n受取確認後、出品者への支払いが確定します。"
    );

    if (!confirm) return;

    setIsLoading(true);
    try {
      const result = await confirmBuyerReceived({
        trade_id: tradeId,
      });

      if (result.success) {
        toast({
          title: "受取確認完了",
          description: "商品の受取を確認しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
      } else {
        toast({
          title: "エラー",
          description: result.message || "受取確認に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("受取確認エラー:", error);
      toast({
        title: "エラー",
        description: "受取確認に失敗しました",
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
      bg="blue.50"
      borderRadius="md"
      borderWidth={2}
      borderColor="blue.200"
    >
      <VStack align="stretch" spacing={3}>
        <HStack>
          <Icon as={FaBox} color="blue.500" boxSize={5} />
          <Text fontSize="md" fontWeight="bold" color="blue.700">
            商品の受取確認
          </Text>
        </HStack>

        {!isBuyerConfirmed ? (
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" color="gray.600">
              商品が届きましたら、下記のチェックボックスで受取を確認してください。
            </Text>

            <Box p={3} bg="yellow.50" borderRadius="md">
              <Text fontSize="xs" color="orange.700" fontWeight="bold" mb={1}>
                ⚠️ 重要
              </Text>
              <Text fontSize="xs" color="gray.600">
                受取確認後、出品者への支払いが確定します。商品に問題がないことを確認してからチェックしてください。
              </Text>
            </Box>

            <Checkbox
              isChecked={isBuyerConfirmed}
              onChange={(e) => handleConfirmReceived(e.target.checked)}
              isDisabled={isLoading || isBuyerConfirmed}
              colorScheme="blue"
            >
              <Text fontSize="sm" fontWeight="bold">
                商品を受け取りました
              </Text>
            </Checkbox>
          </VStack>
        ) : (
          <Box p={3} bg="green.50" borderRadius="md">
            <HStack>
              <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="green.700">
                  受取確認済み
                </Text>
                <Text fontSize="xs" color="gray.600">
                  出品者が取引を完了するまでお待ちください
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PurchaseReceivedConfirmation;
