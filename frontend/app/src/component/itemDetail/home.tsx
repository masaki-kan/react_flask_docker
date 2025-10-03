import { FC, useCallback, useEffect, useState } from "react";
import {
  Text,
  Button,
  Box,
  HStack,
  VStack,
  Avatar,
  useColorModeValue,
  Badge,
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import useItems from "../../hooks/useItems";
import CustomImageSlider from "../slider/customImageSlider";
import { viewDate } from "../../utils/date/format";
import { FaHeart, FaRegHeart, FaUserCircle } from "react-icons/fa";
import { itemTypeViewHandler } from "../../utils/type/itemTypeView";
import { tradeStatusFlags } from "../../consts/profileConsts";
import { tradeApi } from "../../api/tradeApi";
import useAlert from "../../hooks/useAlert";
import { useSelector } from "react-redux";
import { RootState } from "src/store";

const Home: FC = () => {
  const { defaultToast } = useAlert();
  const targetDetailUser = useSelector(
    (state: RootState) => state.users.targetDetailUser
  );
  const navigate = useNavigate();
  const { memorizeuserProfile, memorizeProfile, favoriteUpdateHandler } =
    useMyProfile();
  const { memorizeItemList } = useItems();
  const [itemDetailData, setItemDetailData] = useState<{
    profImage: string;
    uesrname: string;
    userId: string;
    itemUpdateTime: string;
    itemId: string;
    title: string;
    description: string;
    type: string;
    brand: string;
    like: boolean;
    images: string[];
    tradeStatusFlag: number;
  }>({
    profImage: "",
    uesrname: "",
    userId: "",
    itemUpdateTime: "",
    itemId: "",
    title: "",
    description: "",
    type: "",
    brand: "",
    like: false,
    images: [],
    tradeStatusFlag: 0,
  });
  // カラーモードに対応した色
  const bgColor = useColorModeValue("white", "gray.800");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const updateItemDetailData = useCallback(
    (data: {
      profImage: string;
      uesrname: string;
      userId: string;
      itemUpdateTime: string;
      itemId: string;
      title: string;
      description: string;
      type: string;
      brand: string;
      like: boolean;
      images: string[];
      tradeStatusFlag: number;
    }) => {
      setItemDetailData({
        profImage: data.profImage,
        uesrname: data.uesrname,
        userId: data.userId,
        itemUpdateTime: data.itemUpdateTime,
        itemId: data.itemId,
        title: data.title,
        description: data.description,
        type: data.type,
        brand: data.brand,
        like: data.like,
        images: data.images,
        tradeStatusFlag: data.tradeStatusFlag,
      });
    },
    []
  );

  useEffect(() => {
    if (
      memorizeuserProfile.profile.id.length === 0 &&
      memorizeItemList.length === 0
    ) {
      navigate(route.profile);
      return;
    }

    // いいね
    const isLiked = memorizeProfile.profile.likes?.includes(
      Number(targetDetailUser.itemId)
    );
    // アイテム一覧からの商品詳細 表示
    if (memorizeuserProfile.items.length === 0) {
      const filteredItems = memorizeItemList.filter(
        (item) => item.itemId === targetDetailUser.itemId
      );

      const setDate = {
        profImage: filteredItems[0].profile_image || "",
        itemId: filteredItems[0].itemId,
        uesrname: filteredItems[0].uesrname || "",
        userId: String(filteredItems[0].userId || 0),
        itemUpdateTime: viewDate(filteredItems[0].uploaded_at),
        title: filteredItems[0].title,
        description: filteredItems[0].description,
        type: itemTypeViewHandler(filteredItems[0].type),
        brand: filteredItems[0].brand.name,
        like: isLiked,
        images: filteredItems[0].images,
        tradeStatusFlag: filteredItems[0].tradeStatusFlag,
      };
      updateItemDetailData(setDate);
      return;
    }

    // ユーザー一覧からユーザープロフからの商品詳細 表示
    const filteredItems = memorizeuserProfile.items.filter(
      (item) => item.itemId === targetDetailUser.itemId
    );

    const setDate = {
      profImage: memorizeuserProfile.profile.image,
      itemId: filteredItems[0].itemId,
      uesrname: memorizeuserProfile.profile.name,
      userId: String(memorizeuserProfile.profile.id),
      itemUpdateTime: viewDate(filteredItems[0].uploaded_at),
      title: filteredItems[0].title,
      description: filteredItems[0].description,
      type: itemTypeViewHandler(filteredItems[0].type),
      brand: filteredItems[0].brand.name,
      like: isLiked,
      images: filteredItems[0].images,
      tradeStatusFlag: filteredItems[0].tradeStatusFlag,
    };

    updateItemDetailData(setDate);
  }, [
    memorizeItemList,
    memorizeProfile.profile.likes,
    memorizeuserProfile,
    navigate,
    targetDetailUser.itemId,
    updateItemDetailData,
  ]);

  useEffect(() => {
    const isLiked = memorizeProfile.profile.likes?.includes(
      Number(targetDetailUser.itemId)
    );
    setItemDetailData((prev) => {
      return {
        ...prev,
        like: isLiked,
      };
    });

    return;
  }, [
    memorizeItemList,
    memorizeProfile.profile,
    memorizeuserProfile.items.length,
    navigate,
    targetDetailUser.itemId,
  ]);

  // 取引申請
  const tradeHandler = useCallback(async () => {
    const response = await tradeApi(
      itemDetailData.itemId, // 商品ID
      memorizeProfile.profile.id, // 商品交換ユーザーID
      itemDetailData.userId // 商品出品ユーザーID
    );

    if (response.success === true) {
      defaultToast(response.data.message);
      navigate(route.saved);
    }
  }, [
    defaultToast,
    itemDetailData.itemId,
    itemDetailData.userId,
    memorizeProfile.profile.id,
    navigate,
  ]);

  const favoriteClickHandler = useCallback(async () => {
    setItemDetailData((prev) => {
      return {
        ...prev,
        like: !itemDetailData.like,
      };
    });
    await favoriteUpdateHandler(
      itemDetailData.itemId,
      memorizeProfile.profile.id
    );
  }, [
    favoriteUpdateHandler,
    itemDetailData.itemId,
    itemDetailData.like,
    memorizeProfile.profile.id,
  ]);

  const getTradeStatusFlag = useCallback((tradeStatusFlag: number) => {
    const tradeStatus = tradeStatusFlags.filter((flag) => {
      return flag.value === tradeStatusFlag;
    });
    return <>{tradeStatus[0].text}</>;
  }, []);

  return (
    <>
      <Box w="100%" overflowX="hidden">
        <VStack spacing={4} align="stretch" pb={20}>
          {/* ヘッダーセクション */}
          <HStack justify="end" px={{ base: 2, md: 0 }}>
            <Badge
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
              colorScheme={
                itemDetailData.tradeStatusFlag === 0 ? "green" : "orange"
              }
              display={itemDetailData.tradeStatusFlag === 0 ? "none" : "flex"}
            >
              {getTradeStatusFlag(itemDetailData.tradeStatusFlag)}
            </Badge>
          </HStack>

          {/* メインコンテンツグリッド */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 6, lg: 8 }}
            px={{ base: 0, md: 0 }}
          >
            {/* 画像セクション */}
            <GridItem>
              <Box
                position="relative"
                h={{ base: "400px", md: "500px" }}
                borderRadius={{ base: 0, md: "xl" }}
                overflow="hidden"
                bg={bgColor}
                boxShadow={{ base: "none", md: "lg" }}
              >
                <CustomImageSlider images={itemDetailData.images} />
              </Box>
            </GridItem>

            {/* 詳細情報セクション */}
            <GridItem>
              <VStack
                align="stretch"
                spacing={6}
                bg={bgColor}
                p={{ base: 4, md: 6 }}
                borderRadius={{ base: 0, md: "xl" }}
                boxShadow={{ base: "none", md: "lg" }}
                h="full"
              >
                {/* タイトルといいねボタン */}
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={2} flex={1}>
                    <Text
                      fontSize={{ base: "2xl", md: "3xl" }}
                      fontWeight="bold"
                      lineHeight="short"
                    >
                      {itemDetailData.title}
                    </Text>
                    <HStack spacing={3} flexWrap="wrap">
                      <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                        {itemDetailData.type}
                      </Badge>
                      <Badge
                        colorScheme="teal"
                        fontSize="sm"
                        px={3}
                        py={1}
                        hidden={itemDetailData.brand.length === 0}
                      >
                        {itemDetailData.brand}
                      </Badge>
                    </HStack>
                  </VStack>
                  <IconButton
                    aria-label="いいね"
                    icon={itemDetailData.like ? <FaHeart /> : <FaRegHeart />}
                    variant="ghost"
                    size="lg"
                    color={itemDetailData.like ? "red.500" : "gray.400"}
                    onClick={favoriteClickHandler}
                    _hover={{
                      transform: "scale(1.1)",
                      color: "red.500",
                    }}
                    transition="all 0.2s"
                  />
                </Flex>

                <Divider />

                {/* 投稿者情報 */}
                <HStack
                  p={4}
                  bg={hoverBg}
                  borderRadius="lg"
                  spacing={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "sm",
                  }}
                  onClick={() => {
                    navigate(`${route.shopPage}?user=${itemDetailData.userId}`);
                  }}
                >
                  {itemDetailData.profImage !== null ? (
                    <Avatar
                      size={"md"}
                      name={itemDetailData.uesrname}
                      src={itemDetailData.profImage}
                    />
                  ) : (
                    <>
                      <Box mx={"auto"}>
                        <FaUserCircle size={"60px"} color="gray.500" />
                      </Box>
                    </>
                  )}
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="medium">{itemDetailData.uesrname}</Text>
                    <Text fontSize="sm" color={textMuted}>
                      {itemDetailData.itemUpdateTime}
                    </Text>
                  </VStack>
                </HStack>

                {/* 説明文 */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={textMuted}
                    mb={2}
                  >
                    説明
                  </Text>
                  <Text lineHeight="tall">
                    {itemDetailData.description || "説明はありません"}
                  </Text>
                </Box>

                <Divider />

                {/* アクションボタン */}
                <VStack spacing={3} pt={4}>
                  {itemDetailData.tradeStatusFlag === 0 ? (
                    <Button
                      w="full"
                      size="lg"
                      colorScheme="orange"
                      variant="solid"
                      onClick={tradeHandler}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}
                      transition="all 0.2s"
                    >
                      取引を申請する
                    </Button>
                  ) : (
                    <Button w="full" size="lg" isDisabled colorScheme="gray">
                      取引中もしくは取引終了
                    </Button>
                  )}
                </VStack>
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </>
  );
};

export default Home;
