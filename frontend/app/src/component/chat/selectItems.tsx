import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { FC } from "react";
import { FaBox } from "react-icons/fa";
import { userDataType, chatItemDataType } from "../../types/chatType";

type SelectItemsType = {
  buyerSelectedItemId: string | null;
  hasSellerSelectedItem: boolean;
  memorizeBuyerUserData: userDataType;
  memorizeSellerUserData: userDataType;
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
  memorizeSellerUserData,
  onItemOpen,
  onSellerItemOpen,
  selectedSellerItem,
}) => {
  return (
    <>
      <HStack>
        {/* 交換商品表示 Buyerの交換商品 */}
        {buyerSelectedItemId && (
          <Box
            mt={3}
            p={3}
            bg="blue.50"
            borderRadius="md"
            w="50%"
            onClick={onItemOpen}
          >
            <Text fontSize="xs" fontWeight="bold" mb={2} color="blue.700">
              申請者が選択した商品
            </Text>
            <HStack>
              <Icon as={FaBox} color="blue.500" />
              <Text
                fontSize="xs"
                color="gray.600"
                display={"inline-block"}
                wordBreak={"break-word"}
              >
                {memorizeBuyerUserData.name}
              </Text>
            </HStack>

            <Text
              fontSize="xs"
              mt={2}
              color="gray"
              fontWeight="medium"
              variant="outline"
              whiteSpace={"wrap"}
              noOfLines={1}
            >
              {memorizeChatItemData.title}
            </Text>
          </Box>
        )}
        {/* 交換商品表示 Sellerの交換商品 */}
        {hasSellerSelectedItem && (
          <Box
            mt={3}
            p={3}
            bg="blue.50"
            borderRadius="md"
            w="50%"
            onClick={onSellerItemOpen}
          >
            <Text fontSize="xs" fontWeight="bold" mb={2} color="blue.700">
              承認者が選択された商品
            </Text>

            {hasSellerSelectedItem && (
              <HStack>
                <Icon as={FaBox} color="blue.500" />
                <Text fontSize="xs" color="gray.600">
                  {memorizeSellerUserData.name}
                </Text>
              </HStack>
            )}
            <Text
              fontSize="xs"
              mt={2}
              color="gray"
              fontWeight="medium"
              variant="outline"
              whiteSpace={"wrap"}
              noOfLines={1}
            >
              {selectedSellerItem()?.title}
            </Text>
          </Box>
        )}
      </HStack>
    </>
  );
};

export default SelectItems;
