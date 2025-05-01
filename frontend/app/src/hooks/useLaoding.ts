import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLoad } from "../store/loadingSlice";
import { RootState } from "../store";

type useLoadingReturn = {
  memorizeLoading: boolean;
  changeLoading: (state: boolean) => void;
};

const useLoading = (): useLoadingReturn => {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.load);

  const memorizeLoading = useMemo(() => {
    return loading.load;
  }, [loading.load]);

  const changeLoading = useCallback(
    (status: boolean) => {
      dispatch(updateLoad(status));
    },
    [dispatch]
  );
  return {
    memorizeLoading,
    changeLoading,
  };
};

export default useLoading;
