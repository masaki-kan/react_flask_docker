import { type FC } from "react";
import { Heading } from "@chakra-ui/react";
import SavedIndex from "./savedIndex";
import useSaved from "../../hooks/useSaved";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import useLaoding from "../../hooks/useLaoding";

const Home: FC = () => {
  const { memorizeLoading } = useLaoding();
  const { getSavedListHandler } = useSaved();

  useEffectOnce(() => {
    getSavedListHandler();
  });

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Saved
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <SavedIndex />
    </>
  );
};

export default Home;
