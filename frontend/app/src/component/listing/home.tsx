import { type FC } from "react";
import ListingsIndex from "./listingsIndex";
import { Container } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

const Home: FC = () => {
  return (
    <>
      <Container maxW="container.xl">
        <Heading
          pl={{ md: 4, base: 0 }}
          mb={10}
          textAlign={{ base: "center", md: "justify" }}
        >
          Users
        </Heading>
        <ListingsIndex />
      </Container>
    </>
  );
};

export default Home;
