import { FC, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getItemDetailApi } from "../../../api/admin";
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
  SimpleGrid,
} from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import { itemParts } from "../../../consts/itemConsts";
import { brandList } from "../../../consts/brandListi";
import OptimizedImage from "../../render/optimizedImage";

interface ItemInfo {
  item_id: number;
  user_id: number;
  title: string;
  description: string;
  type: string;
  brand: string;
  uploaded_at: string;
  status: string;
  user_name: string;
  user_email: string;
  images: string[];
}

interface LikedUser {
  user_id: number;
  user_name: string;
  user_email: string;
  liked_at: string;
}

const AdminItemDetail: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<ItemInfo | null>(null);
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0);

  const itemId = searchParams.get("item_id");

  useEffect(() => {
    const fetchItemDetail = async () => {
      if (!itemId) {
        setError("商品IDが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getItemDetailApi(Number(itemId));

        if (response && response.success) {
          setItem(response.data.item);
          setLikedUsers(response.data.liked_users);
          setLikeCount(response.data.like_count);
        } else {
          setError("商品情報の取得に失敗しました");
        }
      } catch {
        setError("エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetail();
  }, [itemId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP");
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      available: "green",
      trading: "yellow",
      exchanged: "red",
    };
    return statusMap[status] || "gray";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      available: "販売中",
      trading: "取引中",
      exchanged: "交換済み",
    };
    return statusMap[status] || status;
  };

  const formatType = (typeString: string) => {
    const parsed = JSON.parse(typeString);
    if (typeString === "") return "設定なし";
    return itemParts.map((list: { key: number; name: string }) => {
      if (Number(parsed) === list.key) {
        return list.name;
      }
    });
  };

  const formatBrand = (brandString: string) => {
    const parsed = JSON.parse(brandString);
    // 配列の場合は各要素のnameを結合
    if (parsed.key === "" && parsed.name === "") return "設定なし";
    return brandList.map((list: { key: number; name: string }) => {
      if (parsed.key === list.key) {
        return list.name;
      }
    });
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

  if (error || !item) {
    return (
      <Box p={6}>
        <Card>
          <CardBody>
            <Text color="red.500">{error || "商品が見つかりません"}</Text>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate(route.adminItems)}
            >
              商品一覧に戻る
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
          onClick={() => navigate(route.adminItems)}
          mb={4}
        >
          ← 商品一覧に戻る
        </Button>
        <Heading size="lg" mb={2}>
          商品詳細
        </Heading>
        <Text color="gray.600">ID: {item.item_id}</Text>
      </Box>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* 商品情報カード */}
        <GridItem colSpan={{ base: 12, md: 8 }}>
          <Card>
            <CardHeader bg="blue.50" pb={3}>
              <Heading size="md">商品情報</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    商品名
                  </Text>
                  <Text fontSize="lg" fontWeight="medium">
                    {item.title}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    説明
                  </Text>
                  <Text fontSize="md" whiteSpace="pre-wrap">
                    {item.description}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    タイプ
                  </Text>
                  <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
                    {formatType(item.type)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    ブランド
                  </Text>
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                    {formatBrand(item.brand)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    ステータス
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(item.status)}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    登録日時
                  </Text>
                  <Text>{formatDate(item.uploaded_at)}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          {/* 商品画像カード */}
          <Card mt={6}>
            <CardHeader bg="green.50" pb={3}>
              <Heading size="md">商品画像 ({item.images.length}枚)</Heading>
            </CardHeader>
            <CardBody>
              {item.images.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  画像がありません
                </Text>
              ) : (
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                  {item.images.map((imageUrl, index) => (
                    <Box
                      key={index}
                      borderWidth="1px"
                      borderRadius="lg"
                      overflow="hidden"
                    >
                      <OptimizedImage
                        src={imageUrl}
                        alt={`${item.title} - ${index + 1}`}
                        aspectRatio={1}
                        objectFit="cover"
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* ユーザー情報と統計 */}
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <Card>
            <CardHeader bg="purple.50" pb={3}>
              <Heading size="md">出品者情報</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    ユーザー名
                  </Text>
                  <Text fontSize="lg">{item.user_name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    メールアドレス
                  </Text>
                  <Text fontSize="sm">{item.user_email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    ユーザーID
                  </Text>
                  <Text>{item.user_id}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          <Card mt={6}>
            <CardHeader bg="orange.50" pb={3}>
              <Heading size="md">いいね統計</Heading>
            </CardHeader>
            <CardBody>
              <Box p={4} bg="orange.50" borderRadius="md" textAlign="center">
                <Text fontWeight="bold" color="gray.600" fontSize="sm">
                  合計いいね数
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color="orange.600">
                  {likeCount}
                </Text>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        {/* いいねユーザー一覧 */}
        <GridItem colSpan={12}>
          <Card>
            <CardHeader bg="pink.50" pb={3}>
              <Heading size="md">
                いいねしているユーザー ({likeCount}人)
              </Heading>
            </CardHeader>
            <CardBody>
              {likedUsers.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  いいねしているユーザーがいません
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>ユーザーID</Th>
                        <Th>ユーザー名</Th>
                        <Th>メールアドレス</Th>
                        <Th>いいね日時</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {likedUsers.map((user) => (
                        <Tr key={user.user_id} _hover={{ bg: "gray.50" }}>
                          <Td>{user.user_id}</Td>
                          <Td fontWeight="medium">{user.user_name}</Td>
                          <Td>{user.user_email}</Td>
                          <Td fontSize="xs">{formatDate(user.liked_at)}</Td>
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

export default AdminItemDetail;
