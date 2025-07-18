import { FC, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Image,
  Box,
  Grid,
  GridItem,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import useChat from "../../hooks/useChat";
import ItemDetailModal from "./itemDetailModal";
import { chatItemDataType } from "../../types/chatType";
import { itemParts } from "../../consts/itemConsts";

interface PartnerItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  partnerName: string;
}

const PartnerItemsModal: FC<PartnerItemsModalProps> = ({
  isOpen,
  onClose,
  partnerName,
}) => {
  const { memorizePartnerItems } = useChat();
  const {
    isOpen: isItemDetailOpen,
    onOpen: onItemDetailOpen,
    onClose: onItemDetailClose,
  } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<chatItemDataType | null>(
    null
  );

  const handleItemClick = (item: chatItemDataType) => {
    setSelectedItem(item);
    onItemDetailOpen();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{partnerName}さんの商品一覧</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {memorizePartnerItems && memorizePartnerItems.length > 0 ? (
              <Grid
                templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                gap={4}
              >
                {memorizePartnerItems.map((item) => (
                  <GridItem key={item.item_id}>
                    <Box
                      borderWidth={1}
                      borderRadius="lg"
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => handleItemClick(item)}
                      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      {item.images && item.images.length > 0 && (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          h="150px"
                          w="100%"
                          objectFit="cover"
                        />
                      )}
                      <Box p={3}>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          noOfLines={2}
                          mb={2}
                        >
                          {item.title}
                        </Text>
                        <VStack align="start" spacing={1}>
                          {item.type && item.type.length > 0 && (
                            <Badge colorScheme="blue" size="sm">
                              {itemParts
                                .filter(
                                  (type) => type.key === Number(item.type)
                                )
                                .map((type) => {
                                  return type.name;
                                })}
                            </Badge>
                          )}
                          <Badge colorScheme="purple" size="sm">
                            {item.brand.name}
                          </Badge>
                        </VStack>
                      </Box>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">商品がありません</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 商品詳細モーダル */}
      {selectedItem !== null && (
        <ItemDetailModal
          isOpen={isItemDetailOpen}
          onClose={onItemDetailClose}
          itemData={selectedItem}
        />
      )}
    </>
  );
};

export default PartnerItemsModal;
