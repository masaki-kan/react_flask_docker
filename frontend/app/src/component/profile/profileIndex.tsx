import { FC, useCallback, useMemo, useState, useEffect } from "react";
import {
  VStack,
  Text,
  Avatar,
  Tag,
  Wrap,
  Link,
  Button,
  HStack,
  Box,
  Grid,
  GridItem,
  Heading,
  Icon,
  Divider,
  useColorModeValue,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import MyItems from "./myItems";
import useMyProfile from "../../hooks/useProfile";
import LogOut from "../layout/logOut";
import { useNavigate } from "react-router-dom";
import { plans } from "../../consts/profileConsts";
import {
  FaUserCircle,
  FaEdit,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHeart,
  FaStore,
  FaLink,
  FaComment,
  FaCrown,
  FaHistory,
  FaTrash,
} from "react-icons/fa";
import { IconType } from "react-icons";
import ExchangeArchiveModal from "../archive/exchangeArchiveModal";
import PurchaseArchiveModal from "../archive/purchaseArchiveModal";
import { MdOutlineShoppingBag } from "react-icons/md";
import { route } from "../../route/routeConst";
import WithdrawalButton from "./withdrawalButton";
import CreditCardSection from "./creditCardSection";
import { TokenManager, decodeJWTPayload } from "../../utils/auth/tokenUtils";

type profileIndexType = {
  editFormSwitch: () => void;
};

const ProfileIndex: FC<profileIndexType> = ({ editFormSwitch }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { memorizeProfile, getMyProfile } = useMyProfile();
  // プロフィール情報は即座に表示
  const profile = useMemo(() => memorizeProfile, [memorizeProfile]);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isPurchaseArchiveOpen, setIsPurchaseArchiveOpen] =
    useState<boolean>(false);

  // プロフィールデータが不完全な場合に再取得
  useEffect(() => {
    if (
      profile.profile.id &&
      (!profile.profile.plan || profile.profile.plan === "0")
    ) {
      getMyProfile();
    }
  }, [profile.profile.id, profile.profile.plan, getMyProfile]);

  // 後に削除する
  const preliminaryFunc = useCallback((): boolean => {
    const userToken = TokenManager.getUserToken();
    if (userToken !== null) {
      const getToken = decodeJWTPayload(userToken);

      if (getToken !== null) {
        const preliminaryEmail = getToken.sub;

        return preliminaryEmail !== "californian19691031@gmail.com";
      }
    }

    return true;
  }, []);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.500", "blue.400");

  useEffect(() => {
    if (profile.profile.is_deleted === 1) {
      navigate(route.checkReactivationstatus);
    }
  }, [navigate, profile.profile.is_deleted]);

  const InfoItem: FC<{
    icon: IconType;
    label: string;
    value: React.ReactNode;
    isEmpty?: boolean;
  }> = ({ icon, label, value, isEmpty }) => (
    <VStack align="start" spacing={1} w="full">
      <HStack spacing={2} color={textMuted}>
        <Icon as={icon} boxSize={4} />
        <Text fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </HStack>
      <Box pl={6}>
        {isEmpty ? (
          <Text fontSize="sm" color={textMuted} fontStyle="italic">
            未設定
          </Text>
        ) : (
          <Box fontSize="md" fontWeight="medium">
            {value}
          </Box>
        )}
      </Box>
    </VStack>
  );

  const tagsViewRender = useCallback(() => {
    if (profile.profile.tag.length > 0) {
      return (
        <Wrap spacing={2}>
          {profile.profile.tag.map((tag, index) => (
            <Tag
              key={index}
              size="md"
              colorScheme="teal"
              borderRadius="full"
              px={3}
              py={1}
            >
              {tag.name}
            </Tag>
          ))}
        </Wrap>
      );
    }
    return null;
  }, [profile]);

  const favoriteShopViewRender = useCallback(() => {
    if (profile.profile.favoriteShop.name) {
      return (
        <VStack align="start" spacing={2}>
          <Text fontWeight="medium">{profile.profile.favoriteShop.name}</Text>
          {profile.profile.favoriteShop.url && (
            <Link
              href={profile.profile.favoriteShop.url}
              isExternal
              color={accentColor}
              fontSize="sm"
              _hover={{ textDecoration: "underline" }}
            >
              <HStack spacing={1}>
                <Icon as={FaLink} boxSize={3} />
                <Text>ショップを見る</Text>
              </HStack>
            </Link>
          )}
        </VStack>
      );
    }
    return null;
  }, [profile.profile.favoriteShop, accentColor]);

  const planView = (): {
    title: string;
    text: string;
    price: string;
  } | null => {
    if (profile.profile.plan) {
      const plan = plans.find((p) => p.id === profile.profile.plan);
      if (plan) {
        return {
          title: plan.name,
          text: plan.description,
          price: plan.price,
        };
      }
    }

    return null;
  };

  const toItemPushHandler = useCallback(() => {
    navigate(route.myItem);
  }, [navigate]);

  const clearCacheHandler = useCallback(async () => {
    try {
      toast({
        title: "キャッシュをクリア中...",
        description: "データを再取得しています",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      // プロフィールデータを再取得
      await getMyProfile();

      toast({
        title: "キャッシュクリア完了",
        description: "プロフィールデータを更新しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "エラー",
        description: "キャッシュクリアに失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [getMyProfile, toast]);

  return (
    <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={2}>
      {/* 左サイドバー - プロフィール情報 */}
      <GridItem>
        <Box
          bg={bgColor}
          borderRadius="xl"
          p={4}
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
          position="sticky"
          top={4}
        >
          {/* アバターとメイン情報 */}
          <VStack spacing={2}>
            <Box position="relative">
              {profile.profile.image?.length > 0 ? (
                <Avatar
                  size="2xl"
                  src={profile.profile.image}
                  name={profile.profile.name}
                  border="4px solid"
                  borderColor={borderColor}
                />
              ) : (
                <Box
                  p={8}
                  bg={sectionBg}
                  borderRadius="full"
                  border="4px solid"
                  borderColor={borderColor}
                >
                  <Icon as={FaUserCircle} boxSize={16} color="gray.400" />
                </Box>
              )}
              <IconButton
                aria-label="Edit profile"
                icon={<FaEdit />}
                size="sm"
                colorScheme="orange"
                position="absolute"
                bottom={0}
                right={0}
                borderRadius="full"
                onClick={editFormSwitch}
                boxShadow="md"
              />
            </Box>

            <VStack spacing={1}>
              <Heading size="sm">{profile.profile.name}</Heading>
              <HStack>
                <Icon as={FaMapMarkerAlt} color={textMuted} boxSize={4} />
                <Text color={textMuted} fontSize={"sm"}>
                  {profile.profile.location || "未設定"}
                </Text>
              </HStack>
            </VStack>

            <Divider />
            {/* プラン情報 */}
            <Box w="full">
              <HStack
                bg={sectionBg}
                px={4}
                py={2}
                borderRadius="lg"
                justify="space-between"
              >
                <HStack>
                  <Icon as={FaCrown} color="yellow.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold">
                      {planView()?.title || "プラン情報"}
                    </Text>
                    <Text fontSize="xs" color={textMuted}>
                      {planView()?.price}
                      {planView()?.text || ""}
                    </Text>
                  </VStack>
                </HStack>
              </HStack>
            </Box>

            <Button
              w="full"
              variant={"solid"}
              size="md"
              colorScheme="orange"
              onClick={editFormSwitch}
              leftIcon={<FaEdit />}
            >
              プロフィールを編集
            </Button>
          </VStack>
        </Box>
      </GridItem>

      {/* 右側 - 詳細情報 */}
      <GridItem>
        <VStack spacing={4} align="stretch">
          {/* 基本情報セクション */}
          <Box
            bg={bgColor}
            borderRadius="xl"
            p={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>
              基本情報
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <InfoItem
                icon={FaCalendarAlt}
                label="年代"
                value={profile.profile.old ? `${profile.profile.old}代` : null}
                isEmpty={!profile.profile.old}
              />
              <InfoItem
                icon={FaHeart}
                label="古着歴"
                value={
                  profile.profile.age ? `${profile.profile.age}年目` : null
                }
                isEmpty={!profile.profile.age}
              />
            </Grid>
          </Box>
          {/* 好きなジャンル */}
          {profile.profile.tag.length > 0 && (
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>
                好きなジャンル
              </Heading>
              {tagsViewRender()}
            </Box>
          )}
          {/* お気に入りの店 */}
          {profile.profile.favoriteShop.name && (
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
            >
              <InfoItem
                icon={FaStore}
                label="お気に入りの店"
                value={favoriteShopViewRender()}
              />
            </Box>
          )}
          {/* 自己紹介 */}
          {profile.profile.reasen && (
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
            >
              <InfoItem
                icon={FaComment}
                label="自己紹介"
                value={
                  <Text lineHeight="tall" color={textMuted}>
                    {profile.profile.reasen}
                  </Text>
                }
              />
            </Box>
          )}
          <Button
            w="full"
            colorScheme="gray"
            bg={"white"}
            variant="outline"
            size="lg"
            onClick={() => setIsArchiveOpen(true)}
            leftIcon={<FaHistory />}
          >
            交換履歴を見る
          </Button>

          <Button
            w="full"
            colorScheme="gray"
            bg={"white"}
            variant="outline"
            size="lg"
            onClick={() => setIsPurchaseArchiveOpen(true)}
            leftIcon={<FaHistory />}
          >
            履歴を見る
          </Button>

          {/* マイアイテム */}
          <Box
            bg={bgColor}
            borderRadius="xl"
            p={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <Text fontSize={"sm"} color={"gray.400"} mb={2}>
              {preliminaryFunc() ? "登録できる商品数は最大5個" : ""}
            </Text>
            <HStack
              justifyContent={{ base: "space-between", md: "start" }}
              w={"full"}
              alignItems={"center"}
              mb={4}
            >
              <Heading size="md">登録商品</Heading>
              <Button
                size={"sm"}
                colorScheme="orange"
                hidden={preliminaryFunc() && memorizeProfile.items.length === 5}
                leftIcon={<MdOutlineShoppingBag />}
                onClick={toItemPushHandler}
              >
                登録ページ
              </Button>
            </HStack>
            <MyItems />
          </Box>

          <CreditCardSection />
          {/* アカウント設定 */}
          <Box
            bg={bgColor}
            borderRadius="xl"
            p={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>
              アカウント設定
            </Heading>
            <VStack spacing={4} align="stretch">
              {/* キャッシュクリアボタン */}
              <Box>
                <Text fontSize="sm" color={textMuted} mb={2}>
                  データの更新
                </Text>
                <Button
                  w="full"
                  size="md"
                  colorScheme="gray"
                  variant="outline"
                  leftIcon={<FaTrash />}
                  onClick={clearCacheHandler}
                >
                  最新に更新
                </Button>
              </Box>

              {/* ログアウト・退会ボタン */}
              <Box>
                <Text fontSize="sm" color={textMuted} mb={2}>
                  アカウント操作
                </Text>
                <HStack justify="space-between">
                  <LogOut />
                  <WithdrawalButton />
                </HStack>
              </Box>
            </VStack>
          </Box>

          {/* 交換履歴モーダル */}
          <ExchangeArchiveModal
            isOpen={isArchiveOpen}
            onClose={() => setIsArchiveOpen(false)}
          />

          {/* 購入履歴モーダル */}
          <PurchaseArchiveModal
            isOpen={isPurchaseArchiveOpen}
            onClose={() => setIsPurchaseArchiveOpen(false)}
          />
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default ProfileIndex;
