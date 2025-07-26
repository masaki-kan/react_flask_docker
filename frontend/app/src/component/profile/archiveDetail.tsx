import { FC, useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  Icon,
  Heading,
  Divider,
  Button,
  Container,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { route } from "../../route/routeConst";
import ArchiveChat from "./archiveChat";
import ArchiveItemDetail from "./archiveItemDetail";
import ArchiveShippingInfo from "./archiveShippingInfo";
import {
  archiveTradeType,
  archiveMessage,
  archiveShippingInfo,
} from "../../types/archiveTradeType";
import useMyProfile from "../../hooks/useProfile";

const ArchiveDetail: FC = () => {
  const navigate = useNavigate();
  const { getArchiveDetailHandler } = useMyProfile();
  const [loading, setLoading] = useState(true);
  const [archiveData, setArchiveData] = useState<archiveTradeType | null>(null);
  const [messages, setMessages] = useState<archiveMessage[]>([]);
  const [shippingInfo, setShippingInfo] = useState<archiveShippingInfo[]>([]);

  // URLパラメータからarchive_idを取得
  const searchParams = new URLSearchParams(location.search);
  const archiveId = searchParams.get("archive_id");

  // データ取得
  useEffectOnce(() => {
    if (archiveId) {
      fetchArchiveData();
    } else {
      navigate(route.home);
    }
  });

  const fetchArchiveData = async () => {
    setLoading(true);
    const response = await getArchiveDetailHandler(archiveId!);
    if (response !== undefined) {
      setArchiveData(response.archiveData);
      setMessages(response.messages);
      setShippingInfo(response.shippingInfo);
      setLoading(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!archiveData) {
    return (
      <Center h="100vh">
        <Text>データが見つかりません</Text>
      </Center>
    );
  }

  return (
    <Container
      maxW="container.xl"
      py={4}
      mb={20}
      mt={{ base: "8em", md: "6em" }}
    >
      {/* ヘッダー */}
      <HStack mb={4}>
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          戻る
        </Button>
        <Heading size="md">取引履歴詳細</Heading>
      </HStack>

      {/* 取引情報 */}
      <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={4}>
        <HStack justify="space-between" mb={4}>
          <HStack spacing={4}>
            {/* 買い手情報 */}
            <VStack>
              <Text fontSize="xs" color="gray.500">
                交換申請者
              </Text>
              {archiveData.buyer_profile_image_at_archive ? (
                <Avatar
                  size="md"
                  src={archiveData.buyer_profile_image_at_archive}
                  name={archiveData.buyer_name}
                />
              ) : (
                <Icon as={FaUserCircle} boxSize={10} color="gray.400" />
              )}
              <Text fontSize="sm">{archiveData.buyer_name}</Text>
            </VStack>

            <Text fontSize="lg" fontWeight="bold">
              ⇄
            </Text>

            {/* 売り手情報 */}
            <VStack>
              <Text fontSize="xs" color="gray.500">
                交換受理者
              </Text>
              {archiveData.seller_profile_image_at_archive ? (
                <Avatar
                  size="md"
                  src={archiveData.seller_profile_image_at_archive}
                  name={archiveData.seller_name}
                />
              ) : (
                <Icon as={FaUserCircle} boxSize={10} color="gray.400" />
              )}
              <Text fontSize="sm">{archiveData.seller_name}</Text>
            </VStack>
          </HStack>

          <VStack align="end">
            <Badge colorScheme="green">取引完了</Badge>
            <Text fontSize="xs" color="gray.500">
              完了日:{" "}
              {new Date(archiveData.trade_completed_at).toLocaleDateString()}
            </Text>
          </VStack>
        </HStack>

        <Divider my={4} />

        {/* 交換商品情報 */}
        <HStack spacing={4} align="start">
          {archiveData.seller_exchange_item_archive_id && (
            <ArchiveItemDetail
              title="売り手の交換商品"
              itemTitle={archiveData.seller_exchange_title}
              itemDescription={archiveData.seller_exchange_description}
              itemImages={archiveData.seller_exchange_images}
              itemType={archiveData.seller_exchange_type}
              itemBrand={archiveData.seller_exchange_brand}
            />
          )}

          {archiveData.buyer_exchange_item_archive_id && (
            <ArchiveItemDetail
              title="買い手の交換商品"
              itemTitle={archiveData.buyer_exchange_title}
              itemDescription={archiveData.buyer_exchange_description}
              itemImages={archiveData.buyer_exchange_images}
              itemType={archiveData.buyer_exchange_type}
              itemBrand={archiveData.buyer_exchange_brand}
            />
          )}
        </HStack>

        <Divider my={4} />

        {/* 配送情報 */}
        <ArchiveShippingInfo shippingInfo={shippingInfo} />
      </Box>

      {/* チャット履歴 */}
      <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
        <Heading size="sm" mb={4}>
          チャット履歴
        </Heading>
        <ArchiveChat messages={messages} />
      </Box>
    </Container>
  );
};

export default ArchiveDetail;
