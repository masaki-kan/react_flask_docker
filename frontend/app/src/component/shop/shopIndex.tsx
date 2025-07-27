import { FC, useCallback, useEffect, useState } from "react";
import {
  Avatar,
  VStack,
  Tag,
  Text,
  Link,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  useColorModeValue,
  Button,
  Wrap,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { userFollewApi } from "./../../api/followApi";
import { useDispatch } from "react-redux";
import useAlert from "../../hooks/useAlert";
import useLaoding from "../../hooks/useLaoding";
import { setTargetDetailUser } from "../../store/usersSlice";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHeart,
  FaStore,
  FaComment,
  FaLink,
} from "react-icons/fa";
import { IconType } from "react-icons";
import RebderItem from "../common/render/renderItem";

const ShopIndex: FC = () => {
  const dispath = useDispatch();
  const navigate = useNavigate();
  const { defaultToast } = useAlert();
  const [searchParams] = useSearchParams();
  const userNumver = searchParams.get("user");
  const { memorizeuserProfile } = useMyProfile();
  const { changeLoading } = useLaoding();
  const [followCheck, setFollowCheck] = useState<boolean>(false);
  const myProfile = useSelector((state: RootState) => state.profile);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.500", "blue.400");

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

  const itemDetailHanlder = useCallback(
    (index: string) => {
      if (userNumver !== null) {
        dispath(
          setTargetDetailUser({
            itemId: index,
          })
        );
        navigate(`${route.itemDetail}`);
      }
    },
    [dispath, navigate, userNumver]
  );

  useEffect(() => {
    if (memorizeuserProfile.profile.id === "") {
      changeLoading(true);
    } else {
      changeLoading(false);
      if (memorizeuserProfile.profile.is_following !== undefined) {
        setFollowCheck(memorizeuserProfile.profile.is_following);
      }
    }
  }, [
    changeLoading,
    dispath,
    memorizeuserProfile.profile.id,
    memorizeuserProfile.profile.is_following,
  ]);

  const tagsViewRender = useCallback(() => {
    if (memorizeuserProfile.profile.tag.length > 0) {
      return (
        <Wrap spacing={2}>
          {memorizeuserProfile.profile.tag.map((tag, index) => (
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
  }, [memorizeuserProfile]);

  const favoriteShopViewRender = useCallback(() => {
    if (memorizeuserProfile.profile.favoriteShop.name) {
      return (
        <VStack align="start" spacing={2}>
          <Text fontWeight="medium">
            {memorizeuserProfile.profile.favoriteShop.name}
          </Text>
          {memorizeuserProfile.profile.favoriteShop.url && (
            <Link
              href={memorizeuserProfile.profile.favoriteShop.url}
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
  }, [
    memorizeuserProfile.profile.favoriteShop.name,
    memorizeuserProfile.profile.favoriteShop.url,
    accentColor,
  ]);

  const followUpdataHandler = useCallback(async () => {
    const response = await userFollewApi(
      memorizeuserProfile.profile.id,
      myProfile.profile.id
    );
    if (response !== undefined && response.result !== false) {
      defaultToast(response.action);
      setFollowCheck(response.result ?? false);
      return;
    }
  }, [defaultToast, memorizeuserProfile.profile.id, myProfile.profile.id]);

  return (
    <>
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
          {/* 左サイドバー - プロフィール情報 */}
          <GridItem>
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
              position="sticky"
              top={4}
            >
              {/* アバターとメイン情報 */}
              <VStack spacing={6}>
                <Box position="relative">
                  {memorizeuserProfile.profile.image.length > 0 ? (
                    <Avatar
                      size="2xl"
                      src={memorizeuserProfile.profile.image}
                      name={memorizeuserProfile.profile.name}
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
                      <Icon as={FaUserCircle} boxSize={20} color="gray.400" />
                    </Box>
                  )}
                </Box>
                <Button
                  variant="solid"
                  size={"xs"}
                  onClick={followUpdataHandler}
                >
                  {followCheck === false ? "フォローする" : "フォロー解除する"}
                </Button>
                <VStack spacing={1}>
                  <Heading size="lg">
                    {memorizeuserProfile.profile.name}
                  </Heading>
                  <HStack>
                    <Icon as={FaMapMarkerAlt} color={textMuted} boxSize={4} />
                    <Text color={textMuted}>
                      {memorizeuserProfile.profile.location || "未設定"}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </GridItem>

          {/* 右側 - 詳細情報 */}
          <GridItem>
            <VStack spacing={6} align="stretch">
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
                    value={
                      memorizeuserProfile.profile.old
                        ? `${memorizeuserProfile.profile.old}代`
                        : null
                    }
                    isEmpty={!memorizeuserProfile.profile.old}
                  />
                  <InfoItem
                    icon={FaHeart}
                    label="古着歴"
                    value={
                      memorizeuserProfile.profile.age
                        ? `${memorizeuserProfile.profile.age}年目`
                        : null
                    }
                    isEmpty={!memorizeuserProfile.profile.age}
                  />
                </Grid>
              </Box>

              {/* 好きなジャンル */}
              {memorizeuserProfile.profile.tag.length > 0 && (
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
              {memorizeuserProfile.profile.favoriteShop.name && (
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

              {/* 古着にハマったきっかけ */}
              {memorizeuserProfile.profile.reasen && (
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
                    label="古着にハマったきっかけ"
                    value={
                      <Text lineHeight="tall" color={textMuted}>
                        {memorizeuserProfile.profile.reasen}
                      </Text>
                    }
                  />
                </Box>
              )}

              <Box
                bg={bgColor}
                borderRadius="xl"
                p={6}
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
              >
                {/* アイテム */}
                <VStack align={"start"} w={"full"}>
                  <Heading size="md">登録商品</Heading>
                  {memorizeuserProfile.items.length === 0 ? (
                    <Text size={"xs"} color={"#887563"}>
                      商品がありません。
                    </Text>
                  ) : (
                    <RebderItem
                      itemList={memorizeuserProfile.items}
                      navigate={itemDetailHanlder}
                    />
                  )}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default ShopIndex;
