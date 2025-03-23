import { type FC } from "react";
import { Container } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import MyItemIndex from "./myItemIndex";

const Home: FC = () => {
  return (
    <>
      <Container maxW="container.xl">
        <Heading
          pl={{ md: 4, base: 0 }}
          mb={10}
          textAlign={{ base: "center", md: "justify" }}
        >
          Register New Item
        </Heading>
        <MyItemIndex />
      </Container>
    </>
  );
};

export default Home;
