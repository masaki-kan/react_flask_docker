import { FC } from "react";
import MainHeader from "../common/mainHeader";
import Side from "../common/side";
import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";

const SecureLayout: FC = () => {
  return (
    <>
      <Flex direction={"column"}>
        <MainHeader />
        <Side />
        <Box
          style={{ flex: 1 }}
          mt={{ base: "8em", md: "6em" }}
          pb={10}
          flex="1"
        >
          <Outlet />
        </Box>
      </Flex>
    </>
  );
};

export default SecureLayout;
