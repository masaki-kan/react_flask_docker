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
  Avatar,
  Badge,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
  Button,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaExchangeAlt,
  FaHandshake,
  FaUserCircle,
} from "react-icons/fa";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import useMyProfile from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import { exchangeArchive } from "../../types/archiveTradeType";

// インターフェース名を PascalCase に修正
interface ExchangeArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExchangeArchiveModal: FC<ExchangeArchiveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { memorizeuserProfileArchives } = useMyProfile();
  const [loading, setLoading] = useState(false);
  const [archives, setArchives] = useState<exchangeArchive[]>([]);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      if (
        memorizeuserProfileArchives &&
        memorizeuserProfileArchives.length > 0
      ) {
        // 型アサーションを使用して型を明示的に指定
        setArchives(memorizeuserProfileArchives);
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

  // 取引画面へ遷移する関数
  const handleNavigateToArchive = (archiveTradeId: number) => {
    navigate(`${route.archiveDetail}?archive_id=${archiveTradeId}`);
    onClose(); // モーダルを閉じる
  };

  return (
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

                  {/* 交換内容（超コンパクト） */}
                  <Flex align="center" justify="space-around" gap={2}>
                    {/* 申請者 */}
                    <VStack spacing={1} align="center" flex={1} w={"50%"}>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        textAlign={"center"}
                        width={"100%"}
                      >
                        交換申請者
                      </Text>
                      <HStack
                        spacing={1}
                        justifyContent={"center"}
                        width={"100%"}
                      >
                        {archive.buyer_image ? (
                          <Avatar
                            size="xs"
                            src={archive.buyer_image}
                            name={archive.buyer_name}
                          />
                        ) : (
                          <Icon
                            as={FaUserCircle}
                            boxSize={6}
                            color="gray.400"
                          />
                        )}
                        <Text fontSize="xs" fontWeight="medium">
                          {archive.buyer_name}
                        </Text>
                      </HStack>
                    </VStack>
                    <FaExchangeAlt size={14} />
                    {/* 受理者 */}
                    <VStack spacing={1} align="center" flex={1} w={"50%"}>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        textAlign={"center"}
                        width={"100%"}
                      >
                        交換受理者
                      </Text>
                      <HStack
                        spacing={1}
                        justifyContent={"center"}
                        width={"100%"}
                      >
                        {archive.seller_image ? (
                          <Avatar
                            size="xs"
                            src={archive.seller_image}
                            name={archive.seller_name}
                          />
                        ) : (
                          <Icon
                            as={FaUserCircle}
                            boxSize={6}
                            color="gray.400"
                          />
                        )}
                        <Text fontSize="xs" fontWeight="medium">
                          {archive.seller_name}
                        </Text>
                      </HStack>
                    </VStack>
                  </Flex>

                  {/* 取引開始日 */}
                  <HStack justifyContent={"end"} mt={2}>
                    <Button
                      size={"xs"}
                      leftIcon={<FaHandshake />}
                      onClick={() =>
                        handleNavigateToArchive(archive.archive_trade_id)
                      }
                    >
                      取引画面へ
                    </Button>
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
