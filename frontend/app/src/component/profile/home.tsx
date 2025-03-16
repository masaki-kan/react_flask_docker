import { type FC } from "react";
import Profile from "./profile";
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
          Profile
        </Heading>
        <Profile />
      </Container>
    </>
  );
};

export default Home;
