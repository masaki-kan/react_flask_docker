import { type FC } from "react";
import { useEffectOnce } from "react-use";
import ListingsIndex from "./listingsIndex";
import { Heading } from "@chakra-ui/react";
import useUsers from "../../hooks/useUsers";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";

const Home: FC = () => {
  const { getUserListHandler } = useUsers();
  const { memorizeLoading } = useLaoding();

  useEffectOnce(() => {
    getUserListHandler();
  });

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Users
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <ListingsIndex />
    </>
  );
};

export default Home;
