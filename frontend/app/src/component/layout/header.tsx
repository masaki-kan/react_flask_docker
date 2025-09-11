import { Image, Button, Stack, HStack } from "@chakra-ui/react";
import { type FC } from "react";

type HeaderPropsType = {
  loginSwitch: () => void;
};

const Header: FC<HeaderPropsType> = ({ loginSwitch }) => {
  return (
    <>
      <Stack
        direction="column"
        bg="white"
        width={"full"}
        fontFamily="'Epilogue', 'Noto Sans', sans-serif"
      >
        <HStack
          align="center"
          justifyContent={"space-between"}
          gap="4"
          borderBottom={1}
          borderBottomColor={"#f4f2f0"}
          py={2}
        >
          <Image src={"/ロゴ.svg"} height="35px" />
          <HStack justifyContent={"end"} alignItems={"center"} mr={2}>
            <Button
              minW="80px"
              maxW="480px"
              bg="#e68019"
              color="#181411"
              fontSize="xs"
              fontWeight="bold"
              size="sm"
              onClick={loginSwitch}
            >
              始める
            </Button>
            {/* <Button
              minW="80px"
              maxW="480px"
              bg="#e68019"
              color="#181411"
              fontSize="xs"
              fontWeight="bold"
              size="sm"
              onClick={singupClick}
            >
              Sign up
            </Button> */}
          </HStack>
        </HStack>
      </Stack>
    </>
  );
};

export default Header;
