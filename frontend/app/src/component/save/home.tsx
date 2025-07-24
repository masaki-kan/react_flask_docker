import { type FC } from "react";
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
      {memorizeLoading && <FullScreenSpinner />}
      <SavedIndex />
    </>
  );
};

export default Home;
