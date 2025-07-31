import { type FC } from "react";
import { useEffectOnce } from "react-use";
import ListingsIndex from "./listingsIndex";
import useUsers from "../../hooks/useUsers";

const Home: FC = () => {
  const { getUserListHandler } = useUsers();

  useEffectOnce(() => {
    getUserListHandler();
  });

  return (
    <>
      <ListingsIndex />
    </>
  );
};

export default Home;
