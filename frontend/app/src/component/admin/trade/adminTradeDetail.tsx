import { FC, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getTradeDetailApi } from "../../../api/admin";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Stack,
  Grid,
  GridItem,
  Spinner,
  SimpleGrid,
  Divider,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import OptimizedImage from "../../render/optimizedImage";
import { formatType, formatBrand } from "../../admin/common/formatViews";

interface TradeInfo {
  trade_id: number;
  item_id: number;
  buyer_id: number;
  seller_id: number;
  seller_exchange_item_id: number | null;
  buyer_exchange_item_id: number | null;
  created_at: string;
  status: string;
  seller_item_title: string;
  seller_item_description: string;
  seller_item_type: string;
  seller_item_brand: string;
  seller_item_images: string[];
  seller_name: string;
  seller_email: string;
  buyer_name: string;
  buyer_email: string;
  buyer_item: {
    item_id: number;
    title: string;
    description: string;
    type: string;
    brand: string;
    images: string[];
  } | null;
  seller_exchange_item: {
    item_id: number;
    title: string;
    description: string;
    type: string;
    brand: string;
    images: string[];
  } | null;
}

interface Message {
  message_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  created_at: string;
}

interface ShippingInfo {
  shipping_id: number;
  sender_id: number;
  tracking_number: string;
  shipping_company: string;
  created_at: string;
}

const AdminTradeDetail: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trade, setTrade] = useState<TradeInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo[]>([]);

  const tradeId = searchParams.get("trade_id");

  const fetchTradeDetail = async () => {
    if (!tradeId) {
      setError("取引IDが指定されていません");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getTradeDetailApi(Number(tradeId));

      console.log("getTradeDetailApi : ", response);
      if (response && response.success) {
        setTrade(response.data.trade);
        setMessages(response.data.messages);
        setShippingInfo(response.data.shipping_info);
      } else {
        setError("取引情報の取得に失敗しました");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP");
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "yellow",
      purchased: "yellow",
      shipped: "blue",
      completed: "green",
      cancelled: "red",
    };
    return statusMap[status] || "gray";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "取引中",
      purchased: "取引中",
      shipped: "発送済",
      completed: "完了",
      cancelled: "キャンセル",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error || !trade) {
    return (
      <Box p={6}>
        <Card>
          <CardBody>
            <Text color="red.500">{error || "取引が見つかりません"}</Text>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate(route.adminTrades)}
            >
              取引一覧に戻る
            </Button>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1400px" mx="auto">
      {/* ヘッダー */}
      <Box mb={6}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(route.adminTrades)}
          mb={4}
        >
          ← 取引一覧に戻る
        </Button>
        <Heading size="lg" mb={2}>
          取引詳細
        </Heading>
        <HStack spacing={4} mb={2}>
          <Text color="gray.600">Trade ID: {trade.trade_id}</Text>
          <Badge colorScheme={getStatusColor(trade.status)} fontSize="md">
            {getStatusLabel(trade.status)}
          </Badge>
        </HStack>
        <Button size="sm" onClick={fetchTradeDetail} colorScheme="teal">
          更新
        </Button>
      </Box>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* 左側 - 商品情報 */}
        <GridItem colSpan={{ base: 12, lg: 8 }}>
          {/* 申請者（Buyer）が選択した商品 */}
          <Card mb={6}>
            <CardHeader bg="green.50" pb={3}>
              <Heading size="md">申請者（Buyer）が選択した商品</Heading>
              <Text fontSize="sm" color="gray.600">
                申請者: {trade.buyer_name}
              </Text>
            </CardHeader>
            <CardBody>
              {trade.buyer_item ? (
                <Stack spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">
                      商品名
                    </Text>
                    <Text fontSize="lg">{trade.buyer_item.title}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">
                      説明
                    </Text>
                    <Text whiteSpace="pre-wrap">
                      {trade.buyer_item.description}
                    </Text>
                  </Box>
                  <HStack spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">
                        タイプ
                      </Text>
                      <Badge colorScheme="teal">
                        {formatType(trade.buyer_item.type)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">
                        ブランド
                      </Text>
                      <Badge colorScheme="purple">
                        {formatBrand(trade.buyer_item.brand)}
                      </Badge>
                    </Box>
                  </HStack>
                  <Box>
                    <Text
                      fontWeight="bold"
                      color="gray.600"
                      fontSize="sm"
                      mb={2}
                    >
                      商品画像
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                      {trade.buyer_item.images.map((imageUrl, index) => (
                        <Box
                          key={index}
                          borderWidth="1px"
                          borderRadius="lg"
                          overflow="hidden"
                        >
                          <OptimizedImage
                            src={imageUrl}
                            alt={`${trade.buyer_item?.title} - ${index + 1}`}
                            aspectRatio={1}
                            objectFit="cover"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Stack>
              ) : (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg" mb={4}>
                    まだ商品が選択されていません
                  </Text>
                  <Box
                    display="inline-block"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor="gray.300"
                    borderRadius="lg"
                    p={8}
                    bg="gray.50"
                  >
                    <Text color="gray.400" fontSize="4xl">
                      📦
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>
                      ノーイメージ
                    </Text>
                  </Box>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* 申請を受けた人（Seller）が選択した商品 */}
          <Card mb={6}>
            <CardHeader bg="blue.50" pb={3}>
              <Heading size="md">
                申請を受けた人（Seller）が選択した商品
              </Heading>
              <Text fontSize="sm" color="gray.600">
                申請を受けた人: {trade.seller_name}
              </Text>
            </CardHeader>
            <CardBody>
              {trade.seller_exchange_item ? (
                <Stack spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">
                      商品名
                    </Text>
                    <Text fontSize="lg">
                      {trade.seller_exchange_item.title}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.600" fontSize="sm">
                      説明
                    </Text>
                    <Text whiteSpace="pre-wrap">
                      {trade.seller_exchange_item.description}
                    </Text>
                  </Box>
                  <HStack spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">
                        タイプ
                      </Text>
                      <Badge colorScheme="teal">
                        {formatType(trade.seller_exchange_item.type)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">
                        ブランド
                      </Text>
                      <Badge colorScheme="purple">
                        {formatBrand(trade.seller_exchange_item.brand)}
                      </Badge>
                    </Box>
                  </HStack>
                  <Box>
                    <Text
                      fontWeight="bold"
                      color="gray.600"
                      fontSize="sm"
                      mb={2}
                    >
                      商品画像
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                      {trade.seller_exchange_item.images.map(
                        (imageUrl, index) => (
                          <Box
                            key={index}
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                          >
                            <OptimizedImage
                              src={imageUrl}
                              alt={`${trade.seller_exchange_item?.title} - ${index + 1}`}
                              aspectRatio={1}
                              objectFit="cover"
                            />
                          </Box>
                        )
                      )}
                    </SimpleGrid>
                  </Box>
                </Stack>
              ) : (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg" mb={4}>
                    まだ商品が選択されていません
                  </Text>
                  <Box
                    display="inline-block"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor="gray.300"
                    borderRadius="lg"
                    p={8}
                    bg="gray.50"
                  >
                    <Text color="gray.400" fontSize="4xl">
                      📦
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>
                      ノーイメージ
                    </Text>
                  </Box>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* 発送情報 */}
          {shippingInfo.length > 0 && (
            <Card mb={6}>
              <CardHeader bg="orange.50" pb={3}>
                <Heading size="md">発送情報</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {shippingInfo.map((shipping) => (
                    <Box
                      key={shipping.shipping_id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="orange.50"
                    >
                      <Stack spacing={2}>
                        <HStack>
                          <Text fontWeight="bold">配送業者:</Text>
                          <Text>{shipping.shipping_company}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="bold">追跡番号:</Text>
                          <Text>{shipping.tracking_number}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="bold">発送日:</Text>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(shipping.created_at)}
                          </Text>
                        </HStack>
                      </Stack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}
        </GridItem>

        {/* 右側 - チャット履歴とユーザー情報 */}
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          {/* ユーザー情報 */}
          <Card mb={6}>
            <CardHeader bg="purple.50" pb={3}>
              <Heading size="md">ユーザー情報</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    申請を受けた人（Seller）
                  </Text>
                  <Text fontSize="lg">{trade.seller_name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {trade.seller_email}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    ID: {trade.seller_id}
                  </Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    申請者（Buyer）
                  </Text>
                  <Text fontSize="lg">{trade.buyer_name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {trade.buyer_email}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    ID: {trade.buyer_id}
                  </Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    取引開始日
                  </Text>
                  <Text fontSize="sm">{formatDate(trade.created_at)}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* チャット履歴 */}
          <Card>
            <CardHeader bg="pink.50" pb={3}>
              <Heading size="md">チャット履歴 ({messages.length})</Heading>
            </CardHeader>
            <CardBody>
              {messages.length === 0 ? (
                <Text color="gray.500" textAlign="center">
                  メッセージがありません
                </Text>
              ) : (
                <VStack
                  spacing={3}
                  align="stretch"
                  maxH="600px"
                  overflowY="auto"
                >
                  {messages.map((message) => (
                    <Box
                      key={message.message_id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      bg={
                        message.sender_id === trade.seller_id
                          ? "blue.50"
                          : "green.50"
                      }
                    >
                      <HStack justifyContent="space-between" mb={1}>
                        <Text fontWeight="bold" fontSize="sm">
                          {message.sender_name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatDate(message.created_at)}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {message.message}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AdminTradeDetail;
