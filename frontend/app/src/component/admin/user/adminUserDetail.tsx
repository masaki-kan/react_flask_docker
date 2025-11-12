import { FC, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserDetailApi } from "../../../api/admin";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stack,
  Grid,
  GridItem,
  Spinner,
} from "@chakra-ui/react";
import { route } from "../../../route/routeConst";

interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  plan: string;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  type: number;
}

interface UserItem {
  item_id: number;
  title: string;
  price: number;
  status: string;
  uploaded_at: string;
  updated_at: string;
}

interface UserTrade {
  trade_id: number;
  item_id: number;
  created_at: string;
  status: string;
  item_name: string;
  price: number;
  seller_name: string;
  buyer_name: string;
}

const AdminUserDetail: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<UserItem[]>([]);
  const [trades, setTrades] = useState<UserTrade[]>([]);

  const userId = searchParams.get("user_id");

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!userId) {
        setError("ユーザーIDが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getUserDetailApi(Number(userId));

        if (response && response.success) {
          setProfile(response.data.profile);

          setItems(response.data.items);
          setTrades(response.data.trades);
        } else {
          setError("ユーザー情報の取得に失敗しました");
        }
      } catch {
        setError("エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  const getPlanLabel = (plan: string) => {
    return plan === "1" ? "年払 5500円" : "月額 550円";
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      available: "green",
      sold: "red",
      pending: "yellow",
    };
    return statusMap[status] || "gray";
  };

  const formatDate = (dateString: string) => {
    if (dateString === undefined) return "---";
    return new Date(dateString).toLocaleString("ja-JP");
  };

  const formatPrice = (price: number) => {
    if (price) {
      return `¥${price.toLocaleString()}`;
    }

    return "未設定";
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

  if (error || !profile) {
    return (
      <Box p={6}>
        <Card>
          <CardBody>
            <Text color="red.500">{error || "ユーザーが見つかりません"}</Text>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate(route.adminUsers)}
            >
              ユーザー一覧に戻る
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
          onClick={() => navigate(route.adminUsers)}
          mb={4}
        >
          ← ユーザー一覧に戻る
        </Button>
        <Heading size="lg" mb={2}>
          ユーザー詳細
        </Heading>
        <Text color="gray.600">ID: {profile.user_id}</Text>
      </Box>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* プロフィールカード */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Card>
            <CardHeader bg="blue.50" pb={3}>
              <Heading size="md">プロフィール情報</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    ニックネーム
                  </Text>
                  <Text fontSize="lg">{profile.name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    メールアドレス
                  </Text>
                  <Text fontSize="lg">{profile.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    プラン
                  </Text>
                  <Badge
                    colorScheme={profile.plan === "1" ? "purple" : "blue"}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {getPlanLabel(profile.plan)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    利用状態
                  </Text>
                  <Badge
                    colorScheme={profile.is_deleted === 0 ? "green" : "red"}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {profile.is_deleted === 0 ? "利用中" : "退会済"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    登録日時
                  </Text>
                  <Text>{formatDate(profile.created_at)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    最終更新日時
                  </Text>
                  <Text>{formatDate(profile.updated_at)}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        {/* 統計情報カード */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Card>
            <CardHeader bg="green.50" pb={3}>
              <Heading size="md">統計情報</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    登録商品数
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    {items.length}件
                  </Text>
                </Box>
                <Box p={4} bg="orange.50" borderRadius="md">
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    取引中
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                    {trades.length}件
                  </Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        {/* 商品一覧 */}
        <GridItem colSpan={12}>
          <Card>
            <CardHeader bg="purple.50" pb={3}>
              <Heading size="md">登録商品一覧 ({items.length}件)</Heading>
            </CardHeader>
            <CardBody>
              {items.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  商品がありません
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>商品ID</Th>
                        <Th>商品名</Th>
                        <Th>価格</Th>
                        <Th>ステータス</Th>
                        <Th>登録日時</Th>
                        <Th>更新日時</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {items.map((item) => (
                        <Tr key={item.item_id} _hover={{ bg: "gray.50" }}>
                          <Td>{item.item_id}</Td>
                          <Td fontWeight="medium">{item.title}</Td>
                          <Td fontWeight="bold" color="green.600">
                            {formatPrice(item.price)}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </Td>
                          <Td fontSize="xs">{formatDate(item.uploaded_at)}</Td>
                          <Td fontSize="xs">{formatDate(item.updated_at)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* 取引一覧 */}
        <GridItem colSpan={12}>
          <Card>
            <CardHeader bg="orange.50" pb={3}>
              <Heading size="md">取引履歴 ({trades.length}件)</Heading>
            </CardHeader>
            <CardBody>
              {trades.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  取引がありません
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>取引ID</Th>
                        <Th>商品名</Th>
                        <Th>価格</Th>
                        <Th>出品者</Th>
                        <Th>購入者</Th>
                        <Th>ステータス</Th>
                        <Th>取引開始日時</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {trades.map((trade) => (
                        <Tr key={trade.trade_id} _hover={{ bg: "gray.50" }}>
                          <Td>{trade.trade_id}</Td>
                          <Td fontWeight="medium">{trade.item_name}</Td>
                          <Td fontWeight="bold" color="green.600">
                            {formatPrice(trade.price)}
                          </Td>
                          <Td>{trade.seller_name}</Td>
                          <Td>{trade.buyer_name}</Td>
                          <Td>
                            <Badge colorScheme="orange">{trade.status}</Badge>
                          </Td>
                          <Td fontSize="xs">{formatDate(trade.created_at)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AdminUserDetail;
