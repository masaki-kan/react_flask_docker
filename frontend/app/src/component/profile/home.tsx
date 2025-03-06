import { type FC } from "react";
import ProfileIndex from "./profileIndex";
import { Container } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

const Home: FC = () => {
  return (
    <>
      <Container maxW="container.xl">
        <Heading
          pl={{ md: 4, base: 0 }}
          textAlign={{ base: "center", md: "justify" }}
        >
          Profile
        </Heading>
        <ProfileIndex />
      </Container>
    </>
  );
};

export default Home;
