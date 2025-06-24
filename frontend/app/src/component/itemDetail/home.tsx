import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Heading,
  Text,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Button,
  Box,
  HStack,
  VStack,
  Avatar,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAlert from "../../hooks/useAlert";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import useItems from "../../hooks/useItems";
import KeyboardControlGallerySlider from "../common/slider/keyboardControlGallerySlider";
import { viewDate } from "../common/date/format";
import { getProfileApi } from "../../api/profileApis";
import { FaHeart } from "react-icons/fa";
import { tradeApi } from "../../api/tradeApi";
import { itemTypeViewHanlder } from "../common/type/itemTypeView";
import { tradeStatusFlags } from "../../consts/profileConsts";

const Home: FC = () => {
  const { tradeAlert } = useAlert();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { memorizeuserProfile, memorizeProfile, favoriteUpdateHandler } =
    useMyProfile();

  const { memorizeItemList } = useItems();
  const userItemNumver = searchParams.get("number"); // 'userItem' パラメータの値を取得
  const [itemUser, setItemUser] = useState<{
    name: string;
    image: string;
  }>({
    name: "",
    image: "",
  });
  const [like, setLike] = useState<boolean>(false);

  const memorizeItem = useMemo(() => {
    if (userItemNumver !== null) {
      if (memorizeuserProfile.items.length === 0) {
        return memorizeItemList.filter(
          (item) => String(item.itemId) === String(userItemNumver)
        );
      } else {
        return memorizeuserProfile.items.filter(
          (item) => String(item.itemId) === String(userItemNumver)
        );
      }
    }
    return [];
  }, [memorizeItemList, memorizeuserProfile.items, userItemNumver]);

  const toPrevPageHandler = useCallback(() => {
    if (memorizeuserProfile.items.length === 0) {
      navigate(`${route.items}`);
      return;
    }
    navigate(`${route.shopPage}?userItem=${memorizeuserProfile.profile.id}`);
    return;
  }, [
    memorizeuserProfile.items.length,
    memorizeuserProfile.profile.id,
    navigate,
  ]);

  useEffect(() => {
    // itemsが空 または userItemNumverがnull/undefined/空文字なら遷移
    const noParam =
      userItemNumver === null ||
      userItemNumver === undefined ||
      userItemNumver === "";
    const noItems = memorizeItem.length === 0;

    if (noParam && noItems) {
      navigate(route.items); // パラメータなし + itemsなし → /itemsへ
    } else if (noParam) {
      navigate(route.users); // パラメータなしのみ → /usersへ
    } else if (noItems) {
      navigate(route.items); // itemsなしのみ → /itemsへ
    }
  }, [
    userItemNumver,
    memorizeuserProfile.items.length,
    navigate,
    memorizeItem,
  ]);

  useEffect(() => {
    const itemUser = async () => {
      // 非同期処理
      const response = await getProfileApi(String(memorizeItem[0].user_id));

      if (response !== undefined)
        setItemUser({
          name: response?.profile.name,
          image: response?.profile.image,
        });
    };

    // 即時実行
    if (memorizeItem[0] !== undefined) {
      itemUser();
      const isLiked = memorizeProfile.profile.likes?.includes(
        Number(memorizeItem[0].itemId)
      );
      setLike(isLiked);

      return;
    }
  }, [
    memorizeItem,
    memorizeProfile.profile,
    memorizeuserProfile.items.length,
    navigate,
    userItemNumver,
  ]);

  // 取引開始
  const tradeHandler = useCallback(async () => {
    if (userItemNumver !== null) {
      const response = await tradeApi(
        userItemNumver, // 商品ID
        memorizeProfile.profile.id, // 商品購入ユーザーID
        memorizeItem[0].user_id.toString() // 商品出品ユーザーID
      );

      if (response !== undefined) {
        tradeAlert(response.message).then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            navigate(route.saved);
          }
        });
      }
    }
  }, [
    memorizeItem,
    memorizeProfile.profile.id,
    navigate,
    tradeAlert,
    userItemNumver,
  ]);

  const favoriteClickHandler = useCallback(async () => {
    setLike((prev) => !prev);
    await favoriteUpdateHandler(
      memorizeItem[0].itemId,
      memorizeProfile.profile.id
    );
  }, [favoriteUpdateHandler, memorizeItem, memorizeProfile.profile.id]);

  const getTradeStatusFlag = useCallback((tradeStatusFlag: number) => {
    const tradeStatus = tradeStatusFlags.filter((flag) => {
      return flag.value === tradeStatusFlag;
    });
    return <>{tradeStatus[0].text}</>;
  }, []);

  if (memorizeItem[0] === undefined) {
    navigate(route.items);

    return;
  }

  console.log("memorizeItem", memorizeItem);

  return (
    <>
      <Stack
        direction={"column"}
        justifyContent={"space-around"}
        w={"full"}
        mb={10}
      >
        <Box
          h={"350px"}
          mx={"auto"}
          w={{ base: "100%", md: "50%" }}
          p={4}
          my={2}
          position={"relative"}
        >
          <Box
            position="absolute"
            top="0"
            right="0"
            bg="red.400"
            color="white"
            fontWeight="bold"
            fontSize="md"
            px={3}
            py={1}
            borderRadius="md"
            transform="rotate(5deg)"
            zIndex={2}
            hidden={memorizeItem[0].tradeStatusFlag === 0}
          >
            {getTradeStatusFlag(memorizeItem[0].tradeStatusFlag)}
          </Box>
          <KeyboardControlGallerySlider images={memorizeItem[0].images} />
        </Box>

        <Card
          w={{ base: "full", md: "70%" }}
          mx={"auto"}
          borderWidth={1}
          borderColor={"#edf2f7"}
        >
          <VStack align={"end"} m={2}>
            {like ? (
              <FaHeart
                size={30}
                color="#ff0000"
                onClick={favoriteClickHandler}
                cursor={"pointer"}
              />
            ) : (
              <FaHeart
                size={30}
                onClick={favoriteClickHandler}
                cursor={"pointer"}
              />
            )}
          </VStack>

          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  投稿主
                </Heading>
                <HStack alignItems={"center"}>
                  <Avatar
                    size={"md"}
                    name={"my name"}
                    src={
                      itemUser.image.length > 0
                        ? itemUser.image
                        : "https://bit.ly/broken-link"
                    }
                  />
                  <Text pt="2" fontSize="sm">
                    {itemUser.name}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  投稿日
                </Heading>
                <Text pt="2" fontSize="sm">
                  {viewDate(memorizeItem[0].uploaded_at)}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  商品名
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem[0].title}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  説明
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem[0].description}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  タイプ
                </Heading>
                <Text pt="2" fontSize="sm">
                  {itemTypeViewHanlder(memorizeItem[0].type)}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  ブランド
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem[0].brand.name}
                </Text>
              </Box>
            </Stack>

            <HStack
              align={"start"}
              width={"100%"}
              spacing={5}
              justifyContent={"center"}
            >
              <Button onClick={toPrevPageHandler}>戻る</Button>
              <Button
                hidden={
                  memorizeItem[0].tradeStatusFlag === 1 ||
                  memorizeItem[0].tradeStatusFlag === 2
                }
                colorScheme="blue"
                loadingText="登録..."
                variant="outline"
                spinnerPlacement="start"
                onClick={tradeHandler}
              >
                {"取引する"}
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </Stack>
    </>
  );
};

export default Home;
