import { type FC } from "react";
import Profile from "./profile";
import { Heading } from "@chakra-ui/react";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";

const Home: FC = () => {
  const { memorizeLoading } = useLaoding();

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Profile
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <Profile />
    </>
  );
};

export default Home;
