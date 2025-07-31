import { type FC } from "react";
import { useEffectOnce } from "react-use";
import ListingsIndex from "./listingsIndex";
import useUsers from "../../hooks/useUsers";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../spliner/FullScreenSpinner";

const Home: FC = () => {
  const { getUserListHandler } = useUsers();
  const { memorizeLoading } = useLaoding();

  useEffectOnce(() => {
    getUserListHandler();
  });

  return (
    <>
      {memorizeLoading && <FullScreenSpinner />}
      <ListingsIndex />
    </>
  );
};

export default Home;
