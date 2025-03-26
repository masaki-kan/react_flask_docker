import { FC } from "react";
import MainHeader from "../common/layout/mainHeader";
import Side from "../common/layout/side";
import { Outlet } from "react-router-dom";
import { Box, Container, Flex } from "@chakra-ui/react";

const SecureLayout: FC = () => {
  return (
    <>
      <Flex direction="column" h="100vh">
        <MainHeader />
        <Side />

        <Container maxW="container.xl">
          <Box overflowY="auto" mt={{ base: "8em", md: "6em" }}>
            <Outlet />
          </Box>
        </Container>
      </Flex>
    </>
  );
};

export default SecureLayout;
