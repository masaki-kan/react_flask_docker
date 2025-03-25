import { FC } from "react";
import MainHeader from "../common/layout/mainHeader";
import Side from "../common/layout/side";
import { Outlet } from "react-router-dom";
import { Box, Container, Flex } from "@chakra-ui/react";

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
          <Container maxW="container.xl">
            <Outlet />
          </Container>
        </Box>
      </Flex>
    </>
  );
};

export default SecureLayout;
