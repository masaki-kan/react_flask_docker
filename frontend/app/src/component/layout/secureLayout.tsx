import { FC } from "react";
import MainHeader from "../common/layout/mainHeader";
import Side from "../common/layout/side";
import { Outlet } from "react-router-dom";
import { Container, Flex } from "@chakra-ui/react";

const SecureLayout: FC = () => {
  return (
    <>
      <Flex direction="column" h="100vh">
        <MainHeader />
        <Side />

        <Container
          maxW="container.xl"
          flex="1"
          overflowY="auto"
          mt={{ base: "8em", md: "6em" }}
        >
          <Outlet />
        </Container>
      </Flex>
    </>
  );
};

export default SecureLayout;
