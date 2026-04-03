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
import { FaUndoAlt } from "react-icons/fa";
import { refundPurchase } from "../../api/purchaseApi";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

type RefundButtonProps = {
  tradeId: number;
  sellerId: number;
  purchasePrice: number;
  status: string;
};

/**
 * 返金ボタンコンポーネント
 * Sellerが購入取引を返金する
 */
const RefundButton: FC<RefundButtonProps> = ({
  tradeId,
  sellerId,
  purchasePrice,
  status,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefund = async () => {
    let confirmMessage = `購入者に¥${purchasePrice.toLocaleString()}を全額返金しますか？\n\nこの操作は取り消せません。`;

    if (status === "shipped" || status === "buyer_received") {
      confirmMessage =
        `⚠️ 商品が発送済みの場合、購入者と返品について事前に話し合ってください。\n\n` +
        confirmMessage;
    }

    const confirm = window.confirm(confirmMessage);
    if (!confirm) return;

    setIsLoading(true);
    try {
      const result = await refundPurchase({
        trade_id: tradeId,
        seller_id: sellerId,
      });

      if (result.success) {
        toast({
          title: "返金完了",
          description: `¥${purchasePrice.toLocaleString()}を返金しました`,
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
          description: result.message || "返金に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("返金エラー:", error);
      toast({
        title: "エラー",
        description: "返金に失敗しました",
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
      bg="red.50"
      borderRadius="md"
      borderWidth={1}
      borderColor="red.200"
    >
      <VStack align="stretch" spacing={3}>
        <HStack>
          <Icon as={FaUndoAlt} color="red.500" boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" color="red.700">
            返金
          </Text>
        </HStack>

        <Text fontSize="xs" color="gray.600">
          購入者に¥{purchasePrice.toLocaleString()}を全額返金します。
        </Text>

        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={handleRefund}
          isLoading={isLoading}
          leftIcon={<FaUndoAlt />}
        >
          返金する
        </Button>
      </VStack>
    </Box>
  );
};

export default RefundButton;
