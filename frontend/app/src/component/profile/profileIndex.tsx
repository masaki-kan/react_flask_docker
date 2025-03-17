import { FC } from "react";
import {
  VStack,
  Text,
  Avatar,
  Button,
  Stack,
  Tag,
  Wrap,
  Link,
} from "@chakra-ui/react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { GiThink } from "react-icons/gi";
import { FaHistory } from "react-icons/fa";
import { HiOutlineMailOpen } from "react-icons/hi";
import useLog from "../../hooks/useLog";
import { MdOutlineCategory } from "react-icons/md";
import { profileType } from "../../types/profile";

type ProfileIndexProps = {
  profileData: profileType;
};

const ProfileIndex: FC<ProfileIndexProps> = ({ profileData }) => {
  const { logOutHandler } = useLog();

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"full"}
      >
        <Avatar size={"xl"} mr={4} name={"my name"} src={profileData.image} />
        <VStack align={"start"}>
          <Text size={"sm"}>{profileData.name}</Text>
          <Text size={"sm"} color={"#887563"}>
            Location: {profileData.location}
          </Text>
          <Text size={"sm"} color={"#887563"}>
            年代: {profileData.old}代
          </Text>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<MdOutlineCategory />} size={"xl"} mr={4} />
        <VStack align={"start"}>
          <Text size={"sm"}>好きなジャンル</Text>
          <Wrap gap={2}>
            {profileData.tag.map((tag, index) => {
              return <Tag key={index}>{tag}</Tag>;
            })}
          </Wrap>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<HiOutlineMailOpen />} size={"xl"} mr={4} />
        <VStack align={"start"} spacing={2}>
          <VStack align={"start"} spacing={2}>
            <Text size={"sm"}>お気に入りお店</Text>
            <Text size={"sm"} color={"#887563"}>
              {profileData.favoriteShop.name}
            </Text>
          </VStack>
          <VStack align={"start"} spacing={2}>
            <Text size={"sm"}>お気に入りお店 URL</Text>
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
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<FaHistory />} size={"xl"} mr={4} />
        <VStack align={"start"}>
          <Text size={"sm"}>古着歴</Text>

          <Text size={"sm"} color={"#887563"}>
            {profileData.age}年
          </Text>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<GiThink />} size={"xl"} mr={4} />
        <VStack align={"start"}>
          <Text size={"sm"}>古着にハマったきっかけ</Text>

          <Text size={"sm"} color={"#887563"}>
            {profileData.reasen}
          </Text>
        </VStack>
      </Stack>

      <Button
        leftIcon={<RiLogoutBoxRLine />}
        variant="solid"
        onClick={logOutHandler}
      >
        Log out
      </Button>
    </>
  );
};

export default ProfileIndex;
