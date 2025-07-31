import { FC } from "react";
import { VStack } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";
import FullScreenSpinner from "../spliner/FullScreenSpinner";
import useLaoding from "../../hooks/useLaoding";
import ThreadPage from "./threadPage";

const Home: FC = () => {
  const { memorizeLoading } = useLaoding();

  return (
    <>
      {memorizeLoading && <FullScreenSpinner />}
      <VStack
        align={"start"}
        gap={9}
        w={"100%"}
        mt={{ base: "8em", md: "6em" }}
      >
        <ThreadPage />
      </VStack>
    </>
  );
};

export default Home;
