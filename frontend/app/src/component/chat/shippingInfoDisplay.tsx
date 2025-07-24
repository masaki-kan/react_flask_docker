import { FC } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { shippingInfoType } from "../../types/chatType";
import { FaTruck, FaBox } from "react-icons/fa";

interface ShippingInfoDisplayProps {
  sellerShipping: shippingInfoType;
  buyerShipping: shippingInfoType;
  sellerName: string;
  buyerName: string;
}

const ShippingInfoDisplay: FC<ShippingInfoDisplayProps> = ({
  sellerShipping,
  buyerShipping,
  sellerName,
  buyerName,
}) => {
  const renderShippingInfo = (shipping: shippingInfoType, label: string) => {
    if (!shipping) {
      return (
        <Box
          p={3}
          borderRadius="md"
          borderWidth={1}
          borderColor="gray.200"
          bg="gray.50"
          flex={1}
          width={"50%"}
        >
          <HStack mb={2}>
            <Icon as={FaBox} color="gray.400" />
            <Text fontWeight="bold" fontSize="xs">
              {label}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            まだ発送情報が登録されていません
          </Text>
        </Box>
      );
    }

    return (
      <Box
        p={3}
        borderRadius="md"
        borderWidth={1}
        borderColor="green.200"
        bg="green.50"
        flex={1}
        width={"50%"}
      >
        <HStack mb={2}>
          <Icon as={FaTruck} color="green.500" />
          <Text fontWeight="bold" fontSize="xs">
            {label}
          </Text>
          <Badge colorScheme="green" ml="auto">
            発送済み
          </Badge>
        </HStack>

        <VStack align="start" spacing={1}>
          <HStack>
            <Text fontSize="xs" color="gray.600">
              配送会社:
            </Text>
            <Text fontSize="xs" fontWeight="medium">
              {shipping.shipping_company}
            </Text>
          </HStack>

          <VStack gap={0} align={"start"}>
            <Text fontSize="xs" color="gray.600">
              追跡番号:
            </Text>
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="blue.600"
              wordBreak={"break-all"}
            >
              {shipping.tracking_number}
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  };

  return (
    <Box w="100%" mt={4}>
      <VStack spacing={3}>
        <HStack w="100%" spacing={3} align="stretch">
          {renderShippingInfo(buyerShipping, buyerName || "交換申請した人")}
          {renderShippingInfo(sellerShipping, sellerName || "交換を受ける人")}
        </HStack>

        {sellerShipping && buyerShipping && (
          <>
            <Divider />
            <Badge colorScheme="purple" fontSize="xs">
              両者とも発送完了
            </Badge>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ShippingInfoDisplay;
