import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSaveList } from "../store/savedSlice";
import { RootState } from "../store";
import { savedListType } from "../types/savedType";
import { getSavedList } from "../api/trageApi";
import useLoading from "./useLaoding";

type useSavedReturn = {
  memorizeSavedList: savedListType[];
  getSavedListHandler: () => void;
};

const useSaved = (): useSavedReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const memorizeSavedList = useSelector(
    (state: RootState) => state.saved.saveList
  );

  const profile = useSelector((state: RootState) => state.profile);

  const getSavedListHandler = useCallback(async () => {
    changeLoading(true);
    const response = await getSavedList(profile.profile.id);
    if (response !== undefined) {
      console.log(response);

      const savedData = response.trades.map((trage) => {
        return {
          image_url: trage.image_url,
          status: trage.status,
          title: trage.title,
          trade_created_at: trage.trade_created_at,
          trade_id: trage.trade_id,
          user_image_url: trage.user_image_url,
          user_name: trage.user_name,
          user_id: trage.user_id,
        };
      });

      dispatch(setSaveList(savedData));
    }
    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  return {
    memorizeSavedList,
    getSavedListHandler,
  };
};

export default useSaved;
