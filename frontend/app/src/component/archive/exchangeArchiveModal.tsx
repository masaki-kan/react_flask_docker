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
  Flex,
  Image,
  Card,
  IconButton,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaExchangeAlt, FaArrowLeft } from "react-icons/fa";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import useMyProfile from "../../hooks/useProfile";
import {
  archiveTradeItemDetailType,
  brandType,
} from "../../types/archiveTradeType";
import { renderSrc } from "../../utils/views/viewItem";
import CustomImageSlider from "../slider/customImageSlider";

interface ExchangeArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 商品詳細用の型定義
interface SelectedItemDetail {
  title?: string;
  itemTitle?: string;
  itemDescription?: string;
  itemImages?: string[];
  itemType?: string;
  itemBrand?: brandType;
  archiveData?: archiveTradeItemDetailType;
  itemRole?: "buyer" | "seller";
}

type ViewMode = "list" | "detail";

const ExchangeArchiveModal: FC<ExchangeArchiveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { memorizeuserProfileArchives } = useMyProfile();
  const [loading, setLoading] = useState(false);
  const [archives, setArchives] = useState<archiveTradeItemDetailType[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItemDetail | null>(
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
      console.log("memorizeuserProfileArchives", memorizeuserProfileArchives);
      if (
        memorizeuserProfileArchives &&
        memorizeuserProfileArchives.length > 0
      ) {
        setArchives(
          memorizeuserProfileArchives as archiveTradeItemDetailType[]
        );
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [isOpen, memorizeuserProfileArchives]);

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
  const handleItemClick = useCallback(
    (archive: archiveTradeItemDetailType, itemType: "buyer" | "seller") => {
      if (itemType === "buyer") {
        setSelectedItem({
          title: `${archive.buyer_name}さんの商品`,
          itemTitle: archive.buyer_item_title,
          itemDescription: archive.buyer_item_description,
          itemImages: archive.buyer_item_images,
          itemType: archive.buyer_item_type,
          itemBrand: archive.buyer_item_brand,
          archiveData: archive,
          itemRole: "buyer",
        });
      } else {
        setSelectedItem({
          title: `${archive.seller_name}さんの商品`,
          itemTitle: archive.seller_item_title,
          itemDescription: archive.seller_item_description,
          itemImages: archive.seller_item_images,
          itemType: archive.seller_item_type,
          itemBrand: archive.seller_item_brand,
          archiveData: archive,
          itemRole: "seller",
        });
      }
      setViewMode("detail");
    },
    []
  );

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
          <Text color="gray.500">交換履歴がありません</Text>
        </Center>
      ) : (
        <VStack spacing={3} align="stretch">
          {archives.map((archive, index) => (
            <Box key={index} bg={bgColor} p={3}>
              {/* 日付とバッジ */}
              <HStack justify="space-between" mb={2}>
                <HStack spacing={1}>
                  <Icon as={FaCalendarAlt} color="gray.500" boxSize={3} />
                  <Text fontSize="xs" color="gray.600">
                    交換完了日: {formatDate(archive.completed_date)}
                  </Text>
                </HStack>
                {/* <Badge
                  colorScheme={
                    archive.user_role === "seller" ? "blue" : "green"
                  }
                  fontSize="xs"
                >
                  {archive.user_role === "seller" ? "交換受理者" : "交換申請者"}
                </Badge> */}
              </HStack>

              {/* 交換内容（クリック可能） */}
              <Flex align="center" justify="space-around" gap={2}>
                {/* 申請者の商品 */}
                <VStack spacing={1} align="center" flex={1} w={"50%"}>
                  <Card
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                    w={"full"}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                      bg: hoverBgColor,
                    }}
                    onClick={() => handleItemClick(archive, "buyer")}
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textAlign={"center"}
                      width={"100%"}
                      p={1}
                    >
                      交換申請者
                    </Text>
                    <VStack
                      spacing={1}
                      justifyContent={"center"}
                      width={"100%"}
                      p={2}
                    >
                      <Text fontSize="xs" fontWeight="medium">
                        {archive.buyer_name}
                      </Text>
                      {archive.buyer_item_images &&
                        archive.buyer_item_images[0] && (
                          <Box position="relative" w="100%">
                            <Image
                              src={renderSrc(archive.buyer_item_images[0])}
                              alt={archive.buyer_item_title}
                              h="100px"
                              w="100%"
                              objectFit="contain"
                              borderRadius="sm"
                            />
                            <Box
                              position="absolute"
                              bottom={0}
                              left={0}
                              right={0}
                              bg="blackAlpha.600"
                              color="white"
                              fontSize="xs"
                              p={1}
                              textAlign="center"
                              opacity={0}
                              transition="opacity 0.2s"
                              _groupHover={{ opacity: 1 }}
                            >
                              クリックで詳細
                            </Box>
                          </Box>
                        )}
                      <Text fontSize="xs" noOfLines={1}>
                        {archive.buyer_item_title}
                      </Text>
                    </VStack>
                  </Card>
                </VStack>

                <FaExchangeAlt size={14} />

                {/* 受理者の商品 */}
                <VStack spacing={1} align="center" flex={1} w={"50%"}>
                  <Card
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                    w={"full"}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                      bg: hoverBgColor,
                    }}
                    onClick={() => handleItemClick(archive, "seller")}
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textAlign={"center"}
                      width={"100%"}
                      p={1}
                    >
                      交換受理者
                    </Text>
                    <VStack
                      spacing={1}
                      justifyContent={"center"}
                      width={"100%"}
                      p={2}
                    >
                      <Text fontSize="xs" fontWeight="medium">
                        {archive.seller_name}
                      </Text>
                      {archive.seller_item_images &&
                        archive.seller_item_images[0] && (
                          <Box position="relative" w="100%">
                            <Image
                              src={renderSrc(archive.seller_item_images[0])}
                              alt={archive.seller_item_title}
                              h="100px"
                              w="100%"
                              objectFit="contain"
                              borderRadius="sm"
                            />
                            <Box
                              position="absolute"
                              bottom={0}
                              left={0}
                              right={0}
                              bg="blackAlpha.600"
                              color="white"
                              fontSize="xs"
                              p={1}
                              textAlign="center"
                              opacity={0}
                              transition="opacity 0.2s"
                              _groupHover={{ opacity: 1 }}
                            >
                              クリックで詳細
                            </Box>
                          </Box>
                        )}
                      <Text fontSize="xs" noOfLines={1}>
                        {archive.seller_item_title}
                      </Text>
                    </VStack>
                  </Card>
                </VStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </>
  );

  // 詳細ビューのレンダリング
  const renderDetailView = () => {
    if (!selectedItem || !selectedItem.archiveData) return null;
    console.log("selectedItem", selectedItem);

    const archive = selectedItem.archiveData;

    return (
      <VStack spacing={4} align="stretch" px={1}>
        {/* 交換情報のヘッダー */}
        <Box bg="blue.50" p={3} borderRadius="md">
          <HStack justify="space-between" mb={2}>
            <HStack spacing={1}>
              <Icon as={FaCalendarAlt} color="blue.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="medium">
                交換完了日: {formatDate(archive.completed_date)}
              </Text>
            </HStack>
            {/* <Badge
              colorScheme={archive.user_role === "seller" ? "blue" : "green"}
              fontSize="sm"
            >
              {archive.user_role === "seller" ? "交換受理者" : "交換申請者"}
            </Badge> */}
          </HStack>
          <Text fontSize="xs" color="gray.600">
            {selectedItem.itemRole === "buyer" ? "交換申請者" : "交換受理者"}
            の商品詳細
          </Text>
        </Box>

        {/* 商品画像 */}
        {selectedItem.itemImages && selectedItem.itemImages.length > 0 && (
          <Box>
            <CustomImageSlider images={selectedItem.itemImages} />
          </Box>
        )}

        {/* 商品詳細情報 */}
        <Stack divider={<StackDivider />} spacing={4}>
          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              商品名
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {selectedItem.itemTitle}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              所有者
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {selectedItem.itemRole === "buyer"
                ? archive.buyer_name
                : archive.seller_name}
              さん
            </Text>
          </Box>

          {selectedItem.itemType && (
            <Box>
              <Heading size="xs" textTransform="uppercase" mb={2}>
                アイテム種類
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {selectedItem.itemType}
              </Text>
            </Box>
          )}

          {selectedItem.itemBrand && (
            <Box>
              <Heading size="xs" textTransform="uppercase" mb={2}>
                ブランド
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {selectedItem.itemBrand.name}
              </Text>
            </Box>
          )}

          <Box>
            <Heading size="xs" textTransform="uppercase" mb={2}>
              商品説明
            </Heading>
            <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
              {selectedItem.itemDescription}
            </Text>
          </Box>
        </Stack>
      </VStack>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: "full", md: "2xl" }}
      scrollBehavior="inside"
      preserveScrollBarGap
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent
        maxH={{ base: "100vh", md: "90vh" }}
        h={{ base: "100vh", md: "auto" }}
        display="flex"
        flexDirection="column"
      >
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
              <Text>{viewMode === "list" ? "交換履歴" : "商品詳細"}</Text>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          pb={6}
          overflowY="auto"
          flex="1"
          css={{
            // スマホでのスムーズスクロール対応
            "-webkit-overflow-scrolling": "touch",
            "overflow-scrolling": "touch",
            // 自然なスクロールのための設定
            "min-height": "0",
          }}
        >
          {viewMode === "list" ? renderListView() : renderDetailView()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExchangeArchiveModal;
