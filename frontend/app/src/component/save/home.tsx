import { type FC } from "react";
import SavedIndex from "./savedIndex";
import useSaved from "../../hooks/useSaved";
import { useEffectOnce } from "react-use";

const Home: FC = () => {
  const { getSavedListHandler } = useSaved();

  useEffectOnce(() => {
    getSavedListHandler();
  });

  return (
    <>
      <SavedIndex />
    </>
  );
};

export default Home;
