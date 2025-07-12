import { type FC } from "react";
import SavedIndex from "./savedIndex";
import useSaved from "../../hooks/useSaved";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import useLaoding from "../../hooks/useLaoding";
import { menuLists } from "../../consts/menuList";
import ComponentHeader from "../common/layout/componentHeader";

const Home: FC = () => {
  const { memorizeLoading } = useLaoding();
  const { getSavedListHandler } = useSaved();

  useEffectOnce(() => {
    getSavedListHandler();
  });

  return (
    <>
      <ComponentHeader title={menuLists[3].text} />
      {memorizeLoading && <FullScreenSpinner />}
      <SavedIndex />
    </>
  );
};

export default Home;
