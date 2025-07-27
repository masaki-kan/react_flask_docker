import { FC, useEffect, useState } from "react";
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
  Badge,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
  Image,
  Card,
  useDisclosure,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaExchangeAlt } from "react-icons/fa";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import useMyProfile from "../../hooks/useProfile";
import {
  archiveTradeItemDetailType,
  brandType,
} from "../../types/archiveTradeType";
import ArchiveItemDetailModal from "./archiveItemDetailModal";

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
}

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

  // 商品詳細モーダル用
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
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

  // 商品クリック時の処理
  const handleItemClick = (
    archive: archiveTradeItemDetailType,
    itemType: "buyer" | "seller"
  ) => {
    console.log(archive);
    if (itemType === "buyer") {
      setSelectedItem({
        title: `${archive.buyer_name}さんの商品`,
        itemTitle: archive.buyer_item_title,
        itemDescription: archive.buyer_item_description,
        itemImages: archive.buyer_item_images,
        itemType: archive.buyer_item_type,
        itemBrand: archive.buyer_item_brand,
      });
    } else {
      setSelectedItem({
        title: `${archive.seller_name}さんの商品`,
        itemTitle: archive.seller_item_title,
        itemDescription: archive.seller_item_description,
        itemImages: archive.seller_item_images,
        itemType: archive.seller_item_type,
        itemBrand: archive.seller_item_brand,
      });
    }
    onDetailOpen();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>交換履歴</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowY="auto">
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
                  <Box
                    key={index}
                    bg={bgColor}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={borderColor}
                    p={3}
                  >
                    {/* 日付とバッジ */}
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={1}>
                        <Icon as={FaCalendarAlt} color="gray.500" boxSize={3} />
                        <Text fontSize="xs" color="gray.600">
                          交換完了日: {formatDate(archive.completed_date)}
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme={
                          archive.user_role === "seller" ? "blue" : "green"
                        }
                        fontSize="xs"
                      >
                        {archive.user_role === "seller"
                          ? "交換受理者"
                          : "交換申請者"}
                      </Badge>
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
                                    src={archive.buyer_item_images[0]}
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
                                    src={archive.seller_item_images[0]}
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
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 商品詳細モーダル */}
      {selectedItem && (
        <ArchiveItemDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            onDetailClose();
            setSelectedItem(null);
          }}
          title={selectedItem.title}
          itemTitle={selectedItem.itemTitle}
          itemDescription={selectedItem.itemDescription}
          itemImages={selectedItem.itemImages}
          itemType={selectedItem.itemType}
          itemBrand={selectedItem.itemBrand}
        />
      )}
    </>
  );
};

export default ExchangeArchiveModal;
