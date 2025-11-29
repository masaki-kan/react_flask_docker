import { FC, useEffect, useState, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Image,
  Card,
  IconButton,
  Heading,
  Stack,
  StackDivider,
  Badge,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaShoppingCart,
  FaYenSign,
} from "react-icons/fa";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { purchaseArchive } from "../../types/archiveTradeType";
import { renderSrc } from "../../utils/views/viewItem";
import CustomImageSlider from "../slider/customImageSlider";
import useMyProfile from "../../hooks/useProfile";

interface PurchaseArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = "list" | "detail";

const PurchaseArchiveModal: FC<PurchaseArchiveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { memorizeuserProfilePurchaseArchives } = useMyProfile();
  const [loading, setLoading] = useState(false);
  const [archives, setArchives] = useState<purchaseArchive[]>([]);
  const [selectedItem, setSelectedItem] = useState<purchaseArchive | null>(
    null
  );

  // ビューモードの状態管理
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      if (
        memorizeuserProfilePurchaseArchives &&
        memorizeuserProfilePurchaseArchives.length > 0
      ) {
        setArchives(memorizeuserProfilePurchaseArchives as purchaseArchive[]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [isOpen, memorizeuserProfilePurchaseArchives]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日", { locale: ja });
    } catch {
      return "日付不明";
    }
  };

  // リストビューに戻る
  const handleBackToList = useCallback(() => {
    setViewMode("list");
    setSelectedItem(null);
  }, []);

  // 商品クリック時の処理
  const handleItemClick = useCallback((archive: purchaseArchive) => {
    setSelectedItem(archive);
    setViewMode("detail");
  }, []);

  // モーダルを閉じる時の処理
  const handleClose = useCallback(() => {
    setViewMode("list");
    setSelectedItem(null);
    onClose();
  }, [onClose]);

  // リストビューのレンダリング
  const renderListView = () => (
    <>
      {loading ? (
        <Center h="200px">
          <Spinner size="xl" />
        </Center>
      ) : archives.length === 0 ? (
        <Center h="200px">
          <Text color="gray.500">購入履歴がありません</Text>
        </Center>
      ) : (
        <VStack spacing={3} align="stretch">
          {archives.map((archive, index) => (
            <Box key={index} bg={bgColor} p={3}>
              {/* 日付とロール */}
              <HStack justify="space-between" mb={2}>
                <HStack spacing={1}>
                  <Icon as={FaCalendarAlt} color="gray.500" boxSize={3} />
                  <Text fontSize="xs" color="gray.600">
                    購入完了日: {formatDate(archive.completed_date)}
                  </Text>
                </HStack>
                <Badge
                  colorScheme={
                    archive.user_role === "seller" ? "blue" : "purple"
                  }
                  fontSize="xs"
                >
                  {archive.user_role === "seller" ? "販売者" : "購入者"}
                </Badge>
              </HStack>

              {/* 商品情報（クリック可能） */}
              <Card
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
                w="full"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                  bg: hoverBgColor,
                }}
                onClick={() => handleItemClick(archive)}
              >
                <HStack spacing={3} p={3}>
                  {/* 商品画像 */}
                  {archive.item_images && archive.item_images[0] && (
                    <Box flexShrink={0}>
                      <Image
                        src={renderSrc(archive.item_images[0])}
                        alt={archive.item_title}
                        h="80px"
                        w="80px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    </Box>
                  )}

                  {/* 商品情報 */}
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {archive.item_title}
                    </Text>
                    <HStack>
                      <Icon as={FaYenSign} color="purple.500" boxSize={3} />
                      <Text fontSize="md" fontWeight="bold" color="purple.600">
                        {Math.round(archive.purchase_price)}円
                      </Text>
                    </HStack>
                    <HStack spacing={2} fontSize="xs" color="gray.600">
                      <Text>
                        {archive.user_role === "seller"
                          ? `購入者: ${archive.buyer_name}`
                          : `販売者: ${archive.seller_name}`}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Card>
            </Box>
          ))}
        </VStack>
      )}
    </>
  );

  // 詳細ビューのレンダリング
  const renderDetailView = () => {
    if (!selectedItem) return null;

    return (
      <VStack spacing={4} align="stretch" px={1}>
        {/* 購入情報のヘッダー */}
        <Box bg="purple.50" p={3} borderRadius="md">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.600">
                {selectedItem.user_role === "seller"
                  ? "あなたが販売した商品"
                  : "あなたが購入した商品"}
              </Text>
              <HStack>
                <Icon as={FaYenSign} color="purple.500" />
                <Text fontSize="xl" fontWeight="bold" color="purple.600">
                  {selectedItem.purchase_price.toLocaleString()}円
                </Text>
              </HStack>
            </VStack>
            <Badge
              colorScheme={
                selectedItem.user_role === "seller" ? "blue" : "purple"
              }
              fontSize="sm"
              px={3}
              py={1}
            >
              {selectedItem.user_role === "seller" ? "販売者" : "購入者"}
            </Badge>
          </HStack>
        </Box>

        {/* 商品画像 */}
        {selectedItem.item_images && selectedItem.item_images.length > 0 && (
          <Box>
            <CustomImageSlider images={selectedItem.item_images} />
          </Box>
        )}

        {/* 商品詳細情報 */}
        <Stack divider={<StackDivider />} spacing={2}>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              商品名
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {selectedItem.item_title}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              {selectedItem.user_role === "seller" ? "購入者" : "販売者"}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {selectedItem.user_role === "seller"
                ? selectedItem.buyer_name
                : selectedItem.seller_name}
              さん
            </Text>
          </Box>

          {selectedItem.item_brand && (
            <Box>
              <Heading size="xs" textTransform="uppercase" mb={2}>
                ブランド
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {selectedItem.item_brand.name}
              </Text>
            </Box>
          )}

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              商品説明
            </Heading>
            <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
              {selectedItem.item_description}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              取引情報
            </Heading>
            <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
              <HStack>
                <Icon as={FaShoppingCart} />
                <Text>購入日: {formatDate(selectedItem.trade_date)}</Text>
              </HStack>
              <HStack>
                <Icon as={FaCalendarAlt} />
                <Text>完了日: {formatDate(selectedItem.completed_date)}</Text>
              </HStack>
              {selectedItem.paid_at && (
                <HStack>
                  <Icon as={FaYenSign} />
                  <Text>決済日: {formatDate(selectedItem.paid_at)}</Text>
                </HStack>
              )}
            </VStack>
          </Box>
        </Stack>
      </VStack>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: "md", md: "2xl" }}
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
              <Text>{viewMode === "list" ? "購入履歴" : "商品詳細"}</Text>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          pb={6}
          overflowY="auto"
          flex="1"
          css={{
            WebkitOverflowScrolling: "touch",
            overflowScrolling: "touch",
            minHeight: "0",
          }}
        >
          {viewMode === "list" ? renderListView() : renderDetailView()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PurchaseArchiveModal;
