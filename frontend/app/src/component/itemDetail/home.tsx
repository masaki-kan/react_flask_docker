import { FC, useCallback, useMemo } from "react";
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
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAlert from "../../hooks/useAlert";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import useItems from "../../hooks/useItems";
import KeyboardControlGallerySlider from "../common/slider/keyboardControlGallerySlider";
import { itemParts } from "../../consts/itemConsts";
import { viewDate } from "../common/date/format";
const Home: FC = () => {
  const { defaultAlert } = useAlert();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const { memorizeuserProfile } = useMyProfile();
  const { memorizeItemList } = useItems();
  const userItemNumver = searchParams.get("number"); // 'userItem' パラメータの値を取得

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

  const toSaveHandler = useCallback(() => {
    // フラグ更新 更新アラート表示
    // save一覧に遷移
    defaultAlert(false);
    navigate(route.saved);
  }, [defaultAlert, navigate]);

  const toPrevPageHandler = useCallback(() => {
    if (memorizeuserProfile.items.length === 0) {
      navigate(`${route.items}`);
      return;
    }
    navigate(`${route.shopPage}?userItem=${memorizeuserProfile.profile.id}`);
    return;
  }, [memorizeuserProfile, navigate]);

  const itemTypeViewHanlder = useCallback((key: string): string => {
    const type = itemParts.filter((type) => type.key === Number(key));

    return type[0].name;
  }, []);

  if (userItemNumver === null || !userItemNumver) {
    if (memorizeuserProfile.items.length === 0) {
      navigate(route.items);
      return;
    }
    navigate(route.users);

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
        >
          <KeyboardControlGallerySlider images={memorizeItem[0].images} />
        </Box>
        <Card
          w={{ base: "full", md: "70%" }}
          mx={"auto"}
          borderWidth={1}
          borderColor={"#edf2f7"}
        >
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
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
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  価格
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem[0].curr}
                  {memorizeItem[0].price}
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
                colorScheme="blue"
                loadingText="登録..."
                variant="outline"
                spinnerPlacement="start"
                onClick={toSaveHandler}
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
