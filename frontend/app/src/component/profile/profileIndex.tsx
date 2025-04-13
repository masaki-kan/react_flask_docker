import { FC, useCallback } from "react";
import { VStack, Text, Avatar, Stack, Tag, Wrap, Link } from "@chakra-ui/react";
import MyItems from "./myItems";
import useMyProfile from "../../hooks/useProfile";

const ProfileIndex: FC = () => {
  const { memorizeProfile } = useMyProfile();
  const tagsViewRender = useCallback(() => {
    if (memorizeProfile.profile.tag.length > 0) {
      return memorizeProfile.profile.tag.map((tag, index) => {
        return <Tag key={index}>{tag.name}</Tag>;
      });
    }

    return (
      <Text size={"xs"} color={"#887563"}>
        編集画面で設定してください。
      </Text>
    );
  }, [memorizeProfile.profile.tag]);

  const favoriteShopViewRender = useCallback(() => {
    if (memorizeProfile.profile.favoriteShop.name) {
      return (
        <>
          <Text size={"sm"} color={"#887563"}>
            {memorizeProfile.profile.favoriteShop.name}
          </Text>
          <Text size={"sm"} w={"50%"}>
            URL
          </Text>
          <Text size={"sm"} color={"#887563"}>
            <Link
              href={memorizeProfile.profile.favoriteShop.url}
              isExternal
              display={"flex"}
              alignItems={"center"}
            >
              {memorizeProfile.profile.favoriteShop.url}
            </Link>
          </Text>
        </>
      );
    }

    return (
      <Text size={"xs"} color={"#887563"}>
        編集画面で設定してください。
      </Text>
    );
  }, [
    memorizeProfile.profile.favoriteShop.name,
    memorizeProfile.profile.favoriteShop.url,
  ]);

  const reasenViewRender = useCallback(() => {
    if (memorizeProfile.profile.reasen) {
      return (
        <>
          <Text size={"sm"} color={"#887563"}>
            {memorizeProfile.profile.reasen}
          </Text>
        </>
      );
    }

    return (
      <Text size={"xs"} color={"#887563"}>
        編集画面で設定してください。
      </Text>
    );
  }, [memorizeProfile.profile.reasen]);

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
          src={memorizeProfile.profile.image}
        />
        <VStack gap={10}>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>{memorizeProfile.profile.name}</Text>
            <Text size={"sm"} color={"#887563"}>
              Location:{" "}
              {memorizeProfile.profile.location ??
                "編集画面で設定してください。"}
            </Text>
            <Text size={"sm"} color={"#887563"}>
              年代:{" "}
              {memorizeProfile.profile.old
                ? `${memorizeProfile.profile.old} 代`
                : "編集画面で設定してください。"}
            </Text>
            <Text size={"sm"} color={"#887563"}>
              古着歴:{" "}
              {memorizeProfile.profile.age
                ? `${memorizeProfile.profile.age} 年`
                : "編集画面で設定してください。"}
            </Text>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>好きなジャンル</Text>
            <Wrap gap={2}>{tagsViewRender()}</Wrap>
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

          <MyItems />
        </VStack>
      </Stack>
    </>
  );
};

export default ProfileIndex;
