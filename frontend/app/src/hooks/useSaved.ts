import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSaveList } from "../store/savedSlice";
import { RootState } from "../store";
import { savedListType } from "../types/savedType";

type useSavedReturn = {
  memorizeSavedList: savedListType[];
  getSavedListHandler: () => void;
};

const useSaved = (): useSavedReturn => {
  const dispatch = useDispatch();
  const memorizeSavedList = useSelector(
    (state: RootState) => state.saved.saveList
  );

  const getSavedListHandler = useCallback(() => {
    const demoDate = [
      {
        user: {
          id: 1,
          name: "demo user",
          image:
            "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
        },
        item: {
          id: 1,
          name: "Vintage 90s Grunge Plaid Flannel Shirt",
          image:
            "https://cdn.usegalileo.ai/sdxl10/783d7af6-179e-4116-a3b6-0fdd9ad99bcc.png",
        },
        savedtime: "2024/05/21 22:54:20",
      },
    ];
    dispatch(setSaveList(demoDate));
  }, [dispatch]);

  return {
    memorizeSavedList,
    getSavedListHandler,
  };
};

export default useSaved;
