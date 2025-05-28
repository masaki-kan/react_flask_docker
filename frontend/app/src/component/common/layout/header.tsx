import { Box, Heading, Button, Stack, HStack } from "@chakra-ui/react";
import { type FC } from "react";

type HeaderPropsType = {
  singupClick: () => void;
  loginSwitch: () => void;
  formSwitchStatus: boolean;
};

const Header: FC<HeaderPropsType> = ({
  singupClick,
  loginSwitch,
  formSwitchStatus,
}) => {
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
        >
          <HStack justifyContent={"start"}>
            <Box
              color="currentColor"
              as="svg"
              viewBox="0 0 48 48"
              width={"30px"}
              height={"30px"}
              margin={4}
            >
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                ></path>
              </svg>
            </Box>
            <Heading as="h2" size="lg" color="#181411">
              僕らのヴィンテージ
            </Heading>
          </HStack>
          <Button
            minW="84px"
            maxW="480px"
            bg="#e68019"
            color="#181411"
            fontSize="sm"
            marginRight={4}
            fontWeight="bold"
            onClick={() => {
              if (!formSwitchStatus) {
                singupClick();
              } else {
                loginSwitch();
              }
            }}
          >
            {formSwitchStatus ? "Log in" : "Sign up"}
          </Button>
        </HStack>
      </Stack>
    </>
  );
};

export default Header;
