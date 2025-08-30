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
  Button,
  useToast,
  HStack,
  IconButton,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import useChat from "../../hooks/useChat";
import { chatItemDataType } from "../../types/chatType";
import { itemParts } from "../../consts/itemConsts";
import { selectExchangeItemApi } from "../../api/chatApi";
import { renderSrc } from "../../utils/views/viewItem";
import CustomImageSlider from "../slider/customImageSlider";
import { itemTypeViewHandler } from "../../utils/type/itemTypeView";
import { statusView } from "../save/saveStatusView.ts";

interface PartnerItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  partnerName: string;
  isCurrentUserSeller: boolean;
  userId: string;
  onItemSelected: () => void;
}

type ViewMode = "list" | "detail";

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

  // ビューモードの状態管理
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedItem, setSelectedItem] = useState<chatItemDataType | null>(
    null
  );
  const [isSelecting, setIsSelecting] = useState(false);

  // リストビューに戻る
  const handleBackToList = useCallback(() => {
    setViewMode("list");
    setSelectedItem(null);
  }, []);

  // アイテムクリック時の処理
  const handleItemClick = useCallback(
    (item: chatItemDataType) => {
      if (item.trade_status_flag === 0 || !isCurrentUserSeller) {
        setSelectedItem(item);
        setViewMode("detail");
      }
    },
    [isCurrentUserSeller]
  );

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

  // モーダルを閉じる時の処理
  const handleClose = useCallback(() => {
    setViewMode("list");
    setSelectedItem(null);
    onClose();
  }, [onClose]);

  // リストビューのレンダリング
  const renderListView = () => (
    <>
      {isCurrentUserSeller && (
        <Box mb={4} p={3} bg="blue.50" borderRadius="md">
          <Text fontSize="sm">
            交換したい商品を選択してください。
            選択できるのは「選択可能」な商品のみです。
          </Text>
        </Box>
      )}

      {memorizePartnerItems && memorizePartnerItems.length > 0 ? (
        <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
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
                  <Box position="absolute" top={2} right={2} zIndex={1}>
                    {getItemStatusBadge(item)}
                  </Box>

                  {item.images && item.images.length > 0 && (
                    <Image
                      src={renderSrc(item.images[0])}
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
                            .filter((part) => Number(item.type) === part.key)
                            .map((part) => part.name)}
                        </Badge>
                      )}
                      {item.brand && (
                        <Badge colorScheme="purple" size="sm">
                          {item.brand.name}
                        </Badge>
                      )}
                    </VStack>
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
    </>
  );

  // 詳細ビューのレンダリング
  const renderDetailView = () => {
    if (!selectedItem) return null;

    const isSelectable = selectedItem.trade_status_flag === 0;

    return (
      <VStack spacing={4} align="stretch">
        <HStack justifyContent="center">
          <Text fontSize="sm" fontWeight="bold" color="purple.600">
            {statusView(selectedItem.status)}
          </Text>
        </HStack>

        <Box>
          <CustomImageSlider images={selectedItem.images} />
        </Box>

        <Stack divider={<StackDivider />} spacing={4}>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              商品名
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {selectedItem.title}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              タイプ
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {itemTypeViewHandler(selectedItem.type)}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              商品説明
            </Heading>
            <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
              {selectedItem.description}
            </Text>
          </Box>
        </Stack>

        {/* 選択ボタン（sellerのみ） */}
        {isCurrentUserSeller && isSelectable && (
          <Button
            size="md"
            colorScheme="blue"
            width="full"
            onClick={() =>
              handleSelectExchangeItem(String(selectedItem.item_id))
            }
            isLoading={isSelecting}
            isDisabled={!isSelectable || isSelecting}
            loadingText="選択中..."
          >
            この商品を選択
          </Button>
        )}
      </VStack>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      preserveScrollBarGap
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <HStack>
              {viewMode === "detail" && (
                <IconButton
                  aria-label="リストに戻る"
                  icon={<FaArrowLeft />}
                  size="sm"
                  variant="ghost"
                  onClick={handleBackToList}
                />
              )}
              <Text>
                {viewMode === "list"
                  ? isCurrentUserSeller
                    ? `${partnerName}さんの商品から交換商品を選択`
                    : `${partnerName}さんの商品一覧`
                  : "商品詳細"}
              </Text>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto">
          {viewMode === "list" ? renderListView() : renderDetailView()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PartnerItemsModal;
