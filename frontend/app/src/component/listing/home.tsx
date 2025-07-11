import { type FC } from "react";
import { useEffectOnce } from "react-use";
import ListingsIndex from "./listingsIndex";
import useUsers from "../../hooks/useUsers";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import { menuLists } from "../../consts/menuList";
import ComponentUsersHeader from "../common/layout/componentUsersHeader";

const Home: FC = () => {
  const { getUserListHandler, memorizeUserList } = useUsers();
  const { memorizeLoading } = useLaoding();

  useEffectOnce(() => {
    getUserListHandler();
  });

  return (
    <>
      <ComponentUsersHeader
        title={menuLists[0].text}
        userCount={memorizeUserList.length}
      />
      {memorizeLoading && <FullScreenSpinner />}
      <ListingsIndex />
    </>
  );
};

export default Home;
