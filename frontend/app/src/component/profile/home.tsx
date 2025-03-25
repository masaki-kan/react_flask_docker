import { type FC } from "react";
import Profile from "./profile";
import { Heading } from "@chakra-ui/react";

const Home: FC = () => {
  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "center", md: "justify" }}
      >
        Profile
      </Heading>
      <Profile />
    </>
  );
};

export default Home;
