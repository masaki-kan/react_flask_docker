import { FC, useCallback, useEffect, useState } from "react";
import {
  Stack,
  Avatar,
  VStack,
  Wrap,
  Tag,
  Text,
  Link,
  Button,
} from "@chakra-ui/react";
import RebderItem from "../common/render/renderItem";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { userFollewApi } from "./../../api/followApi";
import { useDispatch } from "react-redux";
import useAlert from "../../hooks/useAlert";
import useLaoding from "../../hooks/useLaoding";

const ShopIndex: FC = () => {
  const dispath = useDispatch();
  const { defaultToast } = useAlert();
  const { memorizeuserProfile } = useMyProfile();
  const { changeLoading } = useLaoding();

  const myProfile = useSelector((state: RootState) => state.profile);
  const [followCheck, setFollowCheck] = useState<boolean>(false);
  const navigate = useNavigate();
  const itemDetailHanlder = useCallback(
    (index: number) => {
      navigate(`${route.itemDetail}?number=${index}`);
    },
    [navigate]
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

  const noValueText = () => {
    return (
      <Text size={"xs"} color={"#887563"}>
        未設定
      </Text>
    );
  };

  const tagsViewRender = useCallback(() => {
    if (memorizeuserProfile.profile.tag.length > 0) {
      return memorizeuserProfile.profile.tag.map((tag, index) => {
        return <Tag key={index}>{tag.name}</Tag>;
      });
    }

    return noValueText();
  }, [memorizeuserProfile.profile.tag]);

  const favoriteShopViewRender = useCallback(() => {
    if (memorizeuserProfile.profile.favoriteShop.name) {
      return (
        <>
          <Text size={"sm"} color={"#887563"} ml={4}>
            {memorizeuserProfile.profile.favoriteShop.name}
          </Text>
          <Text size={"sm"} w={"50%"}>
            URL
          </Text>
          <Text size={"sm"} color={"#887563"} ml={4}>
            <Link
              href={memorizeuserProfile.profile.favoriteShop.url}
              isExternal
              display={"flex"}
              alignItems={"center"}
              wordBreak={"break-all"}
            >
              {memorizeuserProfile.profile.favoriteShop.url}
            </Link>
          </Text>
        </>
      );
    }

    return noValueText();
  }, [
    memorizeuserProfile.profile.favoriteShop.name,
    memorizeuserProfile.profile.favoriteShop.url,
  ]);

  const reasenViewRender = useCallback(() => {
    if (memorizeuserProfile.profile.reasen) {
      return (
        <>
          <Text size={"sm"} color={"#887563"} wordBreak={"break-all"} ml={4}>
            {memorizeuserProfile.profile.reasen}
          </Text>
        </>
      );
    }

    return noValueText();
  }, [memorizeuserProfile.profile.reasen]);

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
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"100%"}
        my={4}
      >
        <VStack align={"center"} mr={4}>
          <Avatar
            size={"xl"}
            mx={"auto"}
            name={"my name"}
            src={
              memorizeuserProfile.profile.image.length > 0
                ? memorizeuserProfile.profile.image
                : "https://bit.ly/broken-link"
            }
          />

          <Button variant="solid" size={"xs"} onClick={followUpdataHandler}>
            {followCheck === false ? "フォローする" : "フォロー解除する"}
          </Button>
        </VStack>

        <VStack gap={10}>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>名前</Text>
            <Wrap gap={2} color={"#887563"} ml={4}>
              {memorizeuserProfile.profile.name}
            </Wrap>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>Location</Text>
            <Wrap gap={2} color={"#887563"} ml={4}>
              {memorizeuserProfile.profile.location ?? "未設定"}
            </Wrap>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>年代</Text>
            <Wrap gap={2} color={"#887563"} ml={4}>
              {" "}
              {memorizeuserProfile.profile.old
                ? `${memorizeuserProfile.profile.old} 代`
                : "未設定"}
            </Wrap>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>古着歴</Text>
            <Wrap gap={2} color={"#887563"} ml={4}>
              {" "}
              {memorizeuserProfile.profile.age
                ? `${memorizeuserProfile.profile.age} 年目`
                : "未設定"}
            </Wrap>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>好きなジャンル</Text>
            <Wrap gap={2} ml={4}>
              {tagsViewRender()}
            </Wrap>
          </VStack>

          <VStack align={"start"} spacing={2} width={"100%"}>
            <Text size={"sm"} w={"50%"}>
              お気に入りお店
            </Text>
            {favoriteShopViewRender()}
          </VStack>

          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>古着にハマったきっかけ</Text>
            {reasenViewRender()}
          </VStack>

          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>登録商品</Text>
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
        </VStack>
      </Stack>
    </>
  );
};

export default ShopIndex;
