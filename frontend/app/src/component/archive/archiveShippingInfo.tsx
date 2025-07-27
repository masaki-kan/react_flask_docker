import { FC } from "react";
import { Box, VStack, HStack, Text, Badge, Icon } from "@chakra-ui/react";
import { FaTruck } from "react-icons/fa";
import { archiveShippingInfo as archiveShippingInfoType } from "../../types/archiveTradeType";

interface archiveShippingInfoProps {
  shippingInfo: archiveShippingInfoType[];
}

const archiveShippingInfo: FC<archiveShippingInfoProps> = ({
  shippingInfo,
}) => {
  return (
    <Box>
      <HStack mb={3}>
        <Icon as={FaTruck} color="green.500" />
        <Text fontSize="sm" fontWeight="bold">
          配送情報
        </Text>
      </HStack>

      <HStack spacing={4}>
        {shippingInfo.map((info, index) => (
          <Box
            key={index}
            flex={1}
            p={3}
            borderRadius="md"
            borderWidth={1}
            borderColor="green.200"
            bg="green.50"
          >
            <VStack align="start" spacing={2}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="xs" fontWeight="bold">
                  {info.sender_name}
                </Text>
                <Badge colorScheme="green" size="sm">
                  発送済み
                </Badge>
              </HStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600">
                  配送会社: {info.shipping_company}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  追跡番号: {info.tracking_number}
                </Text>
              </VStack>
            </VStack>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default archiveShippingInfo;
