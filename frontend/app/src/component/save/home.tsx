import { type FC } from "react";
import SavedIndex from "./savedIndex";
import useSaved from "../../hooks/useSaved";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import useLaoding from "../../hooks/useLaoding";
import { menuLists } from "../../consts/menuList";
import ComponentTradeHeader from "../common/layout/componentTradeHeader";

const Home: FC = () => {
  const { memorizeLoading } = useLaoding();
  const { getSavedListHandler, savedList } = useSaved();

  useEffectOnce(() => {
    getSavedListHandler();
  });

  return (
    <>
      <ComponentTradeHeader
        title={menuLists[3].text}
        itemCount={savedList.length}
      />
      {memorizeLoading && <FullScreenSpinner />}
      <SavedIndex />
    </>
  );
};

export default Home;
