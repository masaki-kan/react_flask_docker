import { Box, HStack, Icon, Button, Text } from "@chakra-ui/react";
import { FC } from "react";
import { FaBox } from "react-icons/fa";
import { userDataType, chatItemDataType } from "../../types/chatType";

type SelectItemsType = {
  buyerSelectedItemId: string | null;
  hasSellerSelectedItem: boolean;
  memorizeBuyerUserData: userDataType;
  memorizeChatItemData: chatItemDataType;
  onItemOpen: () => void;
  onSellerItemOpen: () => void;
  selectedSellerItem: () => chatItemDataType | undefined;
};

const SelectItems: FC<SelectItemsType> = ({
  buyerSelectedItemId,
  hasSellerSelectedItem,
  memorizeBuyerUserData,
  memorizeChatItemData,
  onItemOpen,
  onSellerItemOpen,
  selectedSellerItem,
}) => {
  return (
    <>
      <HStack>
        {/* 交換商品表示 Buyerの交換商品 */}
        {buyerSelectedItemId && (
          <Box mt={3} p={3} bg="blue.50" borderRadius="md" w="100%">
            <Text fontSize="xs" fontWeight="bold" mb={2} color="blue.700">
              申請者が選択した商品
            </Text>
            <HStack>
              <Icon as={FaBox} color="blue.500" />
              <Text fontSize="xs" color="gray.600">
                {memorizeBuyerUserData.name}
              </Text>
            </HStack>
            <Button
              mt={2}
              fontSize="xs"
              fontWeight="medium"
              onClick={onItemOpen}
              colorScheme="blue"
              variant="outline"
              bgColor={"white"}
              size={{ base: "xs", md: "sm" }}
            >
              {memorizeChatItemData.title}
            </Button>
          </Box>
        )}
        {/* 交換商品表示 Sellerの交換商品 */}
        {hasSellerSelectedItem && (
          <Box mt={3} p={3} bg="blue.50" borderRadius="md" w="100%">
            <Text fontSize="xs" fontWeight="bold" mb={2} color="blue.700">
              承認者が選択された商品
            </Text>

            {hasSellerSelectedItem && (
              <HStack>
                <Icon as={FaBox} color="blue.500" />
                <Text fontSize="xs" color="gray.600">
                  {memorizeBuyerUserData.name}
                </Text>
              </HStack>
            )}
            <Button
              mt={2}
              fontSize="xs"
              fontWeight="medium"
              onClick={onSellerItemOpen}
              colorScheme="blue"
              variant="outline"
              bgColor={"white"}
              size={{ base: "xs", md: "sm" }}
            >
              {selectedSellerItem()?.title}
            </Button>
          </Box>
        )}
      </HStack>
    </>
  );
};

export default SelectItems;
