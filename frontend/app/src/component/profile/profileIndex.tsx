import { FC, useCallback, useMemo } from "react";
import {
  VStack,
  Text,
  Avatar,
  Stack,
  Tag,
  Wrap,
  Link,
  Button,
  Card,
} from "@chakra-ui/react";
import MyItems from "./myItems";
import useMyProfile from "../../hooks/useProfile";
import LogOut from "../common/layout/logOut";

type profileIndexType = {
  editFormSwitch: () => void;
};

const ProfileIndex: FC<profileIndexType> = ({ editFormSwitch }) => {
  const { memorizeProfile } = useMyProfile();

  const profile = useMemo(() => {
    return memorizeProfile;
  }, [memorizeProfile]);

  const noValueText = () => {
    return (
      <Text size={"xs"} color={"#887563"}>
        未設定
      </Text>
    );
  };
  const tagsViewRender = useCallback(() => {
    if (profile.profile.tag.length > 0) {
      return profile.profile.tag.map((tag, index) => {
        return <Tag key={index}>{tag.name}</Tag>;
      });
    }

    return noValueText();
  }, [profile]);

  const favoriteShopViewRender = useCallback(() => {
    if (profile.profile.favoriteShop.name) {
      return (
        <>
          <Text size={"sm"} color={"#887563"} ml={4}>
            {profile.profile.favoriteShop.name}
          </Text>
          <Text size={"sm"} w={"50%"}>
            URL
          </Text>
          <Text size={"sm"} color={"#887563"} ml={4}>
            <Link
              href={profile.profile.favoriteShop.url}
              isExternal
              display={"flex"}
              alignItems={"center"}
              wordBreak={"break-all"}
            >
              {profile.profile.favoriteShop.url}
            </Link>
          </Text>
        </>
      );
    }

    return noValueText();
  }, [profile.profile.favoriteShop.name, profile.profile.favoriteShop.url]);

  const reasenViewRender = useCallback(() => {
    if (profile.profile.reasen) {
      return (
        <>
          <Text size={"sm"} color={"#887563"} wordBreak={"break-all"} ml={4}>
            {profile.profile.reasen}
          </Text>
        </>
      );
    }

    return noValueText();
  }, [profile.profile.reasen]);

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"100%"}
        my={4}
      >
        <VStack align={"center"}>
          <Avatar
            size={"xl"}
            mr={4}
            name={"my name"}
            src={
              profile.profile.image.length > 0
                ? profile.profile.image
                : "https://bit.ly/broken-link"
            }
          />
          <Button variant="solid" onClick={editFormSwitch}>
            プロフィール編集
          </Button>
        </VStack>
        <Card p={2} w={{ base: "100%", md: "70%" }}>
          <VStack gap={10}>
            <VStack align={"start"} width={"100%"}>
              <Text size={"sm"}>名前</Text>
              <Wrap gap={2} color={"#887563"} ml={4}>
                {profile.profile.name}
              </Wrap>
            </VStack>
            <VStack align={"start"} width={"100%"}>
              <Text size={"sm"}>Location</Text>
              <Wrap gap={2} color={"#887563"} ml={4}>
                {profile.profile.location ?? "未設定"}
              </Wrap>
            </VStack>
            <VStack align={"start"} width={"100%"}>
              <Text size={"sm"}>年代</Text>
              <Wrap gap={2} color={"#887563"} ml={4}>
                {" "}
                {profile.profile.old ? `${profile.profile.old} 代` : "未設定"}
              </Wrap>
            </VStack>
            <VStack align={"start"} width={"100%"}>
              <Text size={"sm"}>古着歴</Text>
              <Wrap gap={2} color={"#887563"} ml={4}>
                {" "}
                {profile.profile.age ? `${profile.profile.age} 年目` : "未設定"}
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

            <MyItems />
            <VStack align={"start"} width={"100%"}>
              <LogOut />
            </VStack>
          </VStack>
        </Card>
      </Stack>
    </>
  );
};

export default ProfileIndex;
