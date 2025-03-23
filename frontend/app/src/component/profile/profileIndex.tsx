import { FC } from "react";
import { VStack, Text, Avatar, Stack, Tag, Wrap, Link } from "@chakra-ui/react";
import { profileType } from "../../types/profile";
import MyItems from "./myItems";

type ProfileIndexProps = {
  profileData: profileType;
};

const ProfileIndex: FC<ProfileIndexProps> = ({ profileData }) => {
  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"100%"}
      >
        <Avatar size={"xl"} mr={4} name={"my name"} src={profileData.image} />
        <VStack gap={10}>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>{profileData.name}</Text>
            <Text size={"sm"} color={"#887563"}>
              Location: {profileData.location}
            </Text>
            <Text size={"sm"} color={"#887563"}>
              年代: {profileData.old}代
            </Text>
            <Text size={"sm"} color={"#887563"}>
              古着歴: {profileData.age}年
            </Text>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>好きなブランド</Text>
            <Wrap gap={2}>
              {profileData.tag.map((tag, index) => {
                return <Tag key={index}>{tag.tagName}</Tag>;
              })}
            </Wrap>
          </VStack>
          <VStack align={"start"} spacing={2} width={"100%"}>
            <Text size={"sm"} w={"50%"}>
              お気に入りお店
            </Text>
            <Text size={"sm"} color={"#887563"}>
              {profileData.favoriteShop.name}
            </Text>
            <Text size={"sm"} w={"50%"}>
              URL
            </Text>
            <Text size={"sm"} color={"#887563"}>
              <Link
                href={profileData.favoriteShop.url}
                isExternal
                display={"flex"}
                alignItems={"center"}
              >
                {profileData.favoriteShop.url}
              </Link>
            </Text>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <Text size={"sm"}>古着にハマったきっかけ</Text>
            <Text size={"sm"} color={"#887563"}>
              {profileData.reasen}
            </Text>
          </VStack>

          <MyItems />
        </VStack>
      </Stack>
    </>
  );
};

export default ProfileIndex;
