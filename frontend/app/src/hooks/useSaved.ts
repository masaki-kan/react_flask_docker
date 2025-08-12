import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSaveList } from "../store/savedSlice";
import { RootState } from "../store";
import { savedListType } from "../types/savedType";
import { getSavedList } from "../api/tradeApi";
import useLoading from "./useLaoding";
import { cancelNotification } from "../utils/alert/showCancelledTradesNotification";

type useSavedReturn = {
  savedList: savedListType[];
  getSavedListHandler: () => void;
};

const useSaved = (): useSavedReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const savedList = useSelector((state: RootState) => state.saved.saveList);
  const profile = useSelector((state: RootState) => state.profile);

  const getSavedListHandler = useCallback(async () => {
    changeLoading(true);
    const response = await getSavedList(profile.profile.id);
    if (response !== undefined) {
      const savedData = response.trades.map((trade) => {
        return {
          image_url: trade.image_url,
          status: trade.status,
          title: trade.title,
          trade_created_at: trade.trade_created_at,
          trade_id: trade.trade_id,
          user_image_url: trade.user_image_url,
          user_name: trade.user_name,
          user_id: trade.user_id,
          last_message_time: trade.last_message_time,
          type: trade.type,
          brand: trade.brand,
          seller_id: trade.seller_id, //交換に出しているユーザー
          buyer_id: trade.buyer_id, // 交換したいユーザー
        };
      });

      dispatch(setSaveList(savedData));

      // キャンセルされた取引がある場合、トーストで通知
      if (response.cancelled_trades && response.cancelled_trades.length > 0) {
        cancelNotification(response.cancelled_trades);
      }
    }
    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  return {
    savedList,
    getSavedListHandler,
  };
};

export default useSaved;
