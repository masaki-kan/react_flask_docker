import { VStack, Text, Avatar, Button, Stack } from "@chakra-ui/react";
import { FC } from "react";
// import { AiOutlineUser } from "react-icons/ai";
import { RiLockPasswordLine, RiLogoutBoxRLine } from "react-icons/ri";
import { CiPhone } from "react-icons/ci";
import { HiOutlineMailOpen } from "react-icons/hi";
import useLog from "../../hooks/useLog";

const ProfileIndex: FC = () => {
  const { logOutHandler } = useLog();

  return (
    <>
      <VStack align={"start"} my={10} ml={{ base: 9, md: 8 }} gap={9}>
        <Stack
          alignItems={"start"}
          direction={{ base: "column", md: "row" }}
          spacing={4}
        >
          {/* <AiOutlineUser /> */}
          <Avatar
            size={"xl"}
            mr={4}
            name={"my name"}
            src="https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png"
          />
          <VStack align={"start"}>
            <Text size={"sm"}>Personal Information</Text>
            <Text size={"sm"} color={"#887563"}>
              Location: San Francisco
            </Text>
            <Text size={"sm"} color={"#887563"}>
              Age: 30
            </Text>
          </VStack>
        </Stack>

        <Stack alignItems={"start"} direction={{ base: "column", md: "row" }}>
          <Avatar icon={<RiLockPasswordLine />} size={"xl"} mr={4} />
          <VStack align={"start"}>
            <Text size={"sm"}>Password</Text>
            <Text size={"sm"} color={"#887563"}>
              ••••••••••••••••••••
            </Text>
          </VStack>
        </Stack>

        <Stack alignItems={"start"} direction={{ base: "column", md: "row" }}>
          <Avatar icon={<CiPhone />} size={"xl"} mr={4} />
          <VStack align={"start"}>
            <Text size={"sm"}>Phone</Text>
            <Text size={"sm"} color={"#887563"}>
              080-0000-0000
            </Text>
          </VStack>
        </Stack>

        <Stack alignItems={"start"} direction={{ base: "column", md: "row" }}>
          <Avatar icon={<HiOutlineMailOpen />} size={"xl"} mr={4} />
          <VStack align={"start"}>
            <Text size={"sm"}>Email</Text>
            <Text size={"sm"} color={"#887563"}>
              ×××××××××××_××××××@gmail.com
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
      </VStack>
    </>
  );
};

export default ProfileIndex;
