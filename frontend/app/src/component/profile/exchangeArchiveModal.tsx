import { FC, useCallback, useEffect, useState } from "react";
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
  Image,
  Avatar,
  Badge,
  Divider,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
} from "@chakra-ui/react";
import { FaExchangeAlt, FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ExchangeArchive {
  trade_id: number;
  trade_date: string;
  completed_date: string;
  user_role: "seller" | "buyer";
  // ユーザー情報
  seller_id: number;
  seller_name: string;
  seller_image: string;
  buyer_id: number;
  buyer_name: string;
  buyer_image: string;
  // 商品情報
  main_item_title: string;
  main_item_images: string[];
  seller_item_title: string;
  seller_item_images: string[];
  buyer_item_title: string;
  buyer_item_images: string[];
}

interface ExchangeArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

const ExchangeArchiveModal: FC<ExchangeArchiveModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [archives, setArchives] = useState<ExchangeArchive[]>([]);
  const [loading, setLoading] = useState(false);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/getExchangeArchive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      if (data.result) {
        setArchives(data.archives);
      }
    } catch (error) {
      console.error("アーカイブ取得エラー:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchArchives();
    }
  }, [fetchArchives, isOpen, userId]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日", { locale: ja });
    } catch {
      return "日付不明";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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
            <VStack spacing={6} align="stretch">
              {archives.map((archive) => (
                <Box
                  key={archive.trade_id}
                  bg={bgColor}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  p={6}
                  boxShadow="sm"
                >
                  {/* ヘッダー：日付と役割 */}
                  <HStack justify="space-between" mb={4}>
                    <HStack spacing={4}>
                      <Icon as={FaCalendarAlt} color="gray.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          交換完了日
                        </Text>
                        <Text fontWeight="bold">
                          {formatDate(archive.completed_date)}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorScheme={
                        archive.user_role === "seller" ? "blue" : "green"
                      }
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {archive.user_role === "seller"
                        ? "交換受理者"
                        : "交換申請者"}
                    </Badge>
                  </HStack>

                  <Divider mb={4} />

                  {/* ユーザー情報と交換内容 */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {/* 交換申請者（Buyer） */}
                    <VStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        交換申請者
                      </Text>
                      <HStack>
                        {archive.buyer_image ? (
                          <Avatar
                            size="md"
                            src={archive.buyer_image}
                            name={archive.buyer_name}
                          />
                        ) : (
                          <Icon
                            as={FaUserCircle}
                            boxSize={10}
                            color="gray.400"
                          />
                        )}
                        <Text fontWeight="medium">{archive.buyer_name}</Text>
                      </HStack>

                      {/* Buyerが提供した商品 */}
                      <Box
                        w="full"
                        bg={sectionBg}
                        p={3}
                        borderRadius="md"
                        mt={2}
                      >
                        <Text fontSize="xs" color="gray.600" mb={2}>
                          提供商品
                        </Text>
                        <VStack spacing={2}>
                          {archive.buyer_item_images[0] && (
                            <Image
                              src={archive.buyer_item_images[0]}
                              alt={archive.buyer_item_title}
                              h="100px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                          )}
                          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                            {archive.buyer_item_title}
                          </Text>
                          {archive.buyer_item_images.length > 1 && (
                            <Text fontSize="xs" color="gray.500">
                              他{archive.buyer_item_images.length - 1}枚
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </VStack>

                    {/* 矢印 */}
                    <Flex align="center" justify="center">
                      <Icon as={FaExchangeAlt} boxSize={8} color="gray.400" />
                    </Flex>

                    {/* 交換受理者（Seller） */}
                    <VStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        交換受理者
                      </Text>
                      <HStack>
                        {archive.seller_image ? (
                          <Avatar
                            size="md"
                            src={archive.seller_image}
                            name={archive.seller_name}
                          />
                        ) : (
                          <Icon
                            as={FaUserCircle}
                            boxSize={10}
                            color="gray.400"
                          />
                        )}
                        <Text fontWeight="medium">{archive.seller_name}</Text>
                      </HStack>

                      {/* Sellerが提供した商品 */}
                      <Box
                        w="full"
                        bg={sectionBg}
                        p={3}
                        borderRadius="md"
                        mt={2}
                      >
                        <Text fontSize="xs" color="gray.600" mb={2}>
                          提供商品
                        </Text>
                        <VStack spacing={2}>
                          {archive.seller_item_images[0] && (
                            <Image
                              src={archive.seller_item_images[0]}
                              alt={archive.seller_item_title}
                              h="100px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                          )}
                          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                            {archive.seller_item_title}
                          </Text>
                          {archive.seller_item_images.length > 1 && (
                            <Text fontSize="xs" color="gray.500">
                              他{archive.seller_item_images.length - 1}枚
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </VStack>
                  </SimpleGrid>

                  {/* 取引開始日 */}
                  <HStack
                    mt={4}
                    pt={4}
                    borderTop="1px solid"
                    borderColor={borderColor}
                  >
                    <Text fontSize="sm" color="gray.500">
                      取引開始日: {formatDate(archive.trade_date)}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExchangeArchiveModal;
