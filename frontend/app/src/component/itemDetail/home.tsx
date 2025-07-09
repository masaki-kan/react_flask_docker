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
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import useItems from "../../hooks/useItems";
import KeyboardControlGallerySlider from "../common/slider/keyboardControlGallerySlider";
import { viewDate } from "../common/date/format";
import { FaHeart } from "react-icons/fa";
import { itemTypeViewHanlder } from "../common/type/itemTypeView";
import { tradeStatusFlags } from "../../consts/profileConsts";
import { tradeApi } from "../../api/tradeApi";
import useAlert from "../../hooks/useAlert";
import { useSelector } from "react-redux";
import { RootState } from "src/store";

const Home: FC = () => {
  const { defaultToast } = useAlert();
  const userItem = useSelector(
    (state: RootState) => state.users.targetDetailUser
  );

  const navigate = useNavigate();
  const { memorizeuserProfile, memorizeProfile, favoriteUpdateHandler } =
    useMyProfile();
  const { memorizeItemList } = useItems();

  const [like, setLike] = useState<boolean>(false);

  const memorizeItem = useMemo(() => {
    if (memorizeuserProfile.items.length === 0) {
      return memorizeItemList.filter(
        (item) => String(item.itemId) === String(userItem.itemId)
      );
    } else {
      return memorizeuserProfile.items.filter(
        (item) => String(item.itemId) === String(userItem.itemId)
      );
    }
  }, [memorizeItemList, memorizeuserProfile.items, userItem.itemId]);

  console.log("memorizeItem", memorizeItem);

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
    if (memorizeItem[0] !== undefined) {
      const isLiked = memorizeProfile.profile.likes?.includes(
        Number(userItem.itemId)
      );
      setLike(isLiked);

      return;
    }
  }, [
    memorizeItem,
    memorizeProfile.profile,
    memorizeuserProfile.items.length,
    navigate,
    userItem,
    userItem.itemId,
    userItem.userId,
  ]);

  // 取引申請
  const tradeHandler = useCallback(async () => {
    const response = await tradeApi(
      userItem.itemId, // 商品ID
      memorizeProfile.profile.id, // 商品購入ユーザーID
      memorizeItem[0].user_id.toString() // 商品出品ユーザーID
    );

    if (response !== undefined) {
      defaultToast(response.message);
      navigate(route.saved);
    }
  }, [
    defaultToast,
    memorizeItem,
    memorizeProfile.profile.id,
    navigate,
    userItem.itemId,
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
                      memorizeItem[0].profile_image.length > 0
                        ? memorizeItem[0].profile_image
                        : "https://bit.ly/broken-link"
                    }
                  />
                  <Text pt="2" fontSize="sm">
                    {memorizeItem[0].user_name}
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
              mt={4}
              justifyContent={"center"}
            >
              <Button onClick={toPrevPageHandler}>戻る</Button>
              <Button
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
