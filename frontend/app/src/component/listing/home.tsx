import { type FC } from "react";
import { useEffectOnce } from "react-use";
import ListingsIndex from "./listingsIndex";
import useUsers from "../../hooks/useUsers";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import { menuLists } from "../../consts/menuList";
import ComponentHeader from "../common/layout/componentHeader";

const Home: FC = () => {
  const { getUserListHandler } = useUsers();
  const { memorizeLoading } = useLaoding();

  useEffectOnce(() => {
    getUserListHandler();
  });

  return (
    <>
      <ComponentHeader title={menuLists[0].text} />
      {memorizeLoading && <FullScreenSpinner />}
      <ListingsIndex />
    </>
  );
};

export default Home;
