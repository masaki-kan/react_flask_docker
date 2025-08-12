import { FC, useState, useCallback } from "react";
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
  Button,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import useChat from "../../hooks/useChat";
import ItemDetailModal from "./itemDetailModal";
import { chatItemDataType } from "../../types/chatType";
import { itemParts } from "../../consts/itemConsts";
import { selectExchangeItemApi } from "../../api/chatApi";

interface PartnerItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  partnerName: string;
  isCurrentUserSeller: boolean;
  userId: string;
  onItemSelected: () => void;
}

const PartnerItemsModal: FC<PartnerItemsModalProps> = ({
  isOpen,
  onClose,
  tradeId,
  partnerName,
  isCurrentUserSeller,
  userId,
  onItemSelected,
}) => {
  const {
    memorizePartnerItems,
    memorizeSelectsellerToBuyerItem,
    updateSelectsellerToBuyerItemHandler,
  } = useChat();
  const toast = useToast();
  const {
    isOpen: isItemDetailOpen,
    onOpen: onItemDetailOpen,
    onClose: onItemDetailClose,
  } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<chatItemDataType | null>(
    null
  );

  const [isSelecting, setIsSelecting] = useState(false);

  const handleItemClick = (item: chatItemDataType) => {
    // 商品詳細を表示（選択可能な商品のみ）
    if (item.trade_status_flag === 0 || !isCurrentUserSeller) {
      setSelectedItem(item);
      onItemDetailOpen();
    }
  };

  // 交換商品として選択
  const handleSelectExchangeItem = useCallback(
    async (itemId: string) => {
      const confirm = window.confirm("この商品でよろしいですか？");

      if (!confirm) return;

      if (!isCurrentUserSeller) {
        toast({
          title: "エラー",
          description: "商品選択は交換を受ける人のみ可能です",
          status: "error",
          duration: 3000,
        });
        return;
      }

      setIsSelecting(true);
      try {
        const result = await selectExchangeItemApi(tradeId, itemId, userId);
        if (result) {
          const filterItem = memorizePartnerItems.filter(
            (item) => item.item_id === Number(itemId)
          );
          updateSelectsellerToBuyerItemHandler(filterItem[0]);
          toast({
            title: "商品選択完了",
            description: "交換商品を選択しました",
            status: "success",
            duration: 3000,
          });
          // 選択完了後の処理
          setTimeout(() => {
            onItemSelected();
            onClose();
          }, 1000);
        }
      } catch (error) {
        console.error("商品選択エラー:", error);
        onClose();
      } finally {
        setIsSelecting(false);
      }
    },
    [
      isCurrentUserSeller,
      toast,
      tradeId,
      userId,
      memorizePartnerItems,
      updateSelectsellerToBuyerItemHandler,
      onItemSelected,
      onClose,
    ]
  );

  // 商品の取引状態を表示
  const getItemStatusBadge = (item: chatItemDataType) => {
    if (item.trade_status_flag === 2) {
      return (
        <Badge colorScheme="gray" size="sm">
          <HStack spacing={1}>
            <FaTimesCircle />
            <Text>取引済み</Text>
          </HStack>
        </Badge>
      );
    } else if (item.trade_status_flag === 1) {
      return (
        <Badge colorScheme="orange" size="sm">
          <HStack spacing={1}>
            <FaTimesCircle />
            <Text>取引中</Text>
          </HStack>
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme="green" size="sm">
          <HStack spacing={1}>
            <FaCheckCircle />
            <Text>選択可能</Text>
          </HStack>
        </Badge>
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior={"inside"}
      >
        <ModalOverlay />
        <ModalContent maxH="70vh" overflowY="auto">
          <ModalHeader>
            {isCurrentUserSeller
              ? `${partnerName}さんの商品から交換商品を選択`
              : `${partnerName}さんの商品一覧`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isCurrentUserSeller && (
              <Box mb={4} p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm">
                  交換したい商品を選択してください。
                  選択できるのは「選択可能」な商品のみです。
                </Text>
              </Box>
            )}

            {memorizePartnerItems && memorizePartnerItems.length > 0 ? (
              <Grid
                templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                gap={4}
              >
                {memorizePartnerItems.map((item) => {
                  const isSelectable = item.trade_status_flag === 0;
                  const isSelected =
                    memorizeSelectsellerToBuyerItem.item_id === item.item_id;

                  return (
                    <GridItem key={item.item_id}>
                      <Box
                        borderWidth={2}
                        borderColor={
                          isSelected
                            ? "blue.500"
                            : isSelectable
                              ? "gray.200"
                              : "gray.100"
                        }
                        borderRadius="lg"
                        overflow="hidden"
                        cursor={
                          isCurrentUserSeller
                            ? isSelectable
                              ? "pointer"
                              : "not-allowed"
                            : "pointer"
                        }
                        opacity={isCurrentUserSeller && !isSelectable ? 0.6 : 1}
                        onClick={() => handleItemClick(item)}
                        _hover={
                          isSelectable || !isCurrentUserSeller
                            ? {
                                shadow: "md",
                                transform: "translateY(-2px)",
                                borderColor: "blue.300",
                              }
                            : {}
                        }
                        transition="all 0.2s"
                        position="relative"
                        bg={isSelected ? "blue.50" : "white"}
                      >
                        {/* 商品ステータスバッジ */}
                        <Box position="absolute" top={2} right={2} zIndex={1}>
                          {getItemStatusBadge(item)}
                        </Box>

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
                            {item.type && (
                              <Badge colorScheme="blue" size="sm">
                                {itemParts
                                  .filter(
                                    (part) => Number(item.type) === part.key
                                  )
                                  .map((part) => part.name)}
                              </Badge>
                            )}
                            {item.brand && (
                              <Badge colorScheme="purple" size="sm">
                                {item.brand.name}
                              </Badge>
                            )}
                          </VStack>

                          {/* 選択ボタン（sellerのみ） */}
                          {isCurrentUserSeller && isSelectable && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              mt={3}
                              width="full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectExchangeItem(String(item.item_id));
                              }}
                              isLoading={isSelecting}
                              isDisabled={!isSelectable || isSelecting}
                              loadingText="選択中..."
                            >
                              {isSelected ? "選択済み" : "この商品を選択"}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </GridItem>
                  );
                })}
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
