import { FC, useCallback } from "react";
import { profileType } from "../../types/profile";
import { Stack, Avatar, VStack, Wrap, Tag, Text, Link } from "@chakra-ui/react";

import RebderItem from "../common/render/renderItem";
import { itemListType } from "../../types/item";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

type ShopIndexProps = {
  profileData: {
    profile: profileType;
    item: itemListType[];
  };
};

const ShopIndex: FC<ShopIndexProps> = ({ profileData }) => {
  const navigate = useNavigate();
  const itemDetailHanlder = useCallback(
    (index: number) => {
      navigate(`${route.itemDetail}?number=${index}`);
    },
    [navigate]
  );

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"100%"}
      >
        <Avatar
          size={"xl"}
          mr={4}
          name={"my name"}
          src={profileData.profile.image}
        />
        <VStack gap={10}>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>{profileData.profile.name}</Text>
            <Text size={"sm"} color={"#887563"}>
              Location: {profileData.profile.location}
            </Text>
            <Text size={"sm"} color={"#887563"}>
              年代: {profileData.profile.old}代
            </Text>
            <Text size={"sm"} color={"#887563"}>
              古着歴: {profileData.profile.age}年
            </Text>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>好きなジャンル</Text>
            <Wrap gap={2}>
              {profileData.profile.tag.map((tag, index) => {
                return <Tag key={index}>{tag.tagName}</Tag>;
              })}
            </Wrap>
          </VStack>
          <VStack align={"start"} spacing={2} width={"100%"}>
            <Text size={"sm"} w={"50%"}>
              お気に入りお店
            </Text>
            <Text size={"sm"} color={"#887563"}>
              {profileData.profile.favoriteShop.name}
            </Text>
            <Text size={"sm"} w={"50%"}>
              URL
            </Text>
            <Text size={"sm"} color={"#887563"}>
              <Link
                href={profileData.profile.favoriteShop.url}
                isExternal
                display={"flex"}
                alignItems={"center"}
              >
                {profileData.profile.favoriteShop.url}
              </Link>
            </Text>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>古着にハマったきっかけ</Text>
            <Text size={"sm"} color={"#887563"}>
              {profileData.profile.reasen}
            </Text>
          </VStack>

          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>登録商品</Text>
            <RebderItem
              itemList={profileData.item}
              navigate={itemDetailHanlder}
            />
          </VStack>
        </VStack>
      </Stack>
    </>
  );
};

export default ShopIndex;
