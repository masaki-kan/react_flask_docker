import { FC } from "react";
import {
  VStack,
  Text,
  Avatar,
  Button,
  Stack,
  Tag,
  Wrap,
} from "@chakra-ui/react";
// import { AiOutlineUser } from "react-icons/ai";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { GiThink } from "react-icons/gi";
import { FaHistory } from "react-icons/fa";
import { HiOutlineMailOpen } from "react-icons/hi";
import useLog from "../../hooks/useLog";
import { MdOutlineCategory } from "react-icons/md";

const ProfileIndex: FC = () => {
  const { logOutHandler } = useLog();

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"full"}
      >
        <Avatar
          size={"xl"}
          mr={4}
          name={"my name"}
          src="https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png"
        />
        <VStack align={"start"}>
          <Text size={"sm"}>Personal Information</Text>
          <Text size={"sm"} color={"#887563"}>
            Location: 大阪
          </Text>
          <Text size={"sm"} color={"#887563"}>
            Age: 30
          </Text>
          <Text size={"sm"} color={"#887563"}>
            年代: 30代
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
            <Tag>Tag 1</Tag>
            <Tag>Tag 2</Tag>
          </Wrap>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<HiOutlineMailOpen />} size={"xl"} mr={4} />
        <VStack align={"start"}>
          <Text size={"sm"}>お気に入りお店</Text>
          <Text size={"sm"} color={"#887563"}>
            ×××××××××××_××××××
          </Text>
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
            ２年
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
            〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇
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
