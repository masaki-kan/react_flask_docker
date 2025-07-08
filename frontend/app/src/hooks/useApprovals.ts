import { useCallback, useMemo } from "react";
import {
  tradeApprovalRequestApi,
  getTradeApprovalListApi,
  postTradeApprovalRespondApi,
} from "./../api/tradeApi";
import useLoading from "./useLaoding";
import useAlert from "./useAlert";
import { useNavigate } from "react-router-dom";
import { route } from "./../route/routeConst";
import { RootState } from "src/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  updateReceivedPpprovals,
  updateSentApprovals,
} from "../store/approvalSlice";
import { tradeApprovalListType } from "src/types/approvalType";
import { approvalSeetalert } from "../component/common/alert/succesSweetalert";

type useApprovalsReture = {
  memorizeApprovalReceivedApprovals: tradeApprovalListType[];
  memorizeApprovalSentApprovals: tradeApprovalListType[];
  getApprovalsList: () => Promise<void>;
  requestApprovals: (item_id: string, requester_id: string) => Promise<void>;
  tradeApprovalRespond: (approval_id: number, status: number) => Promise<void>;
};

const useApprovals = (): useApprovalsReture => {
  const profile = useSelector((state: RootState) => state.profile);
  const approval = useSelector((state: RootState) => state.approval);
  const { changeLoading } = useLoading();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tradeAlert } = useAlert();

  const memorizeApprovalReceivedApprovals = useMemo(() => {
    return approval.receivedApprovals;
  }, [approval.receivedApprovals]);

  const memorizeApprovalSentApprovals = useMemo(() => {
    return approval.sentApprovals;
  }, [approval.sentApprovals]);

  const requestApprovals = useCallback(
    async (item_id: string, requester_id: string) => {
      changeLoading(true);
      const response = await tradeApprovalRequestApi(item_id, requester_id);

      if (response !== undefined) {
        tradeAlert(response.message).then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            navigate(route.approvals);
          }
        });
      }
      changeLoading(false);
    },
    [changeLoading, navigate, tradeAlert]
  );

  const getApprovalsList = useCallback(async () => {
    changeLoading(true);
    const response = await getTradeApprovalListApi(profile.profile.id);

    if (response !== undefined) {
      console.log("response >", response);

      const sentApprovals = response.sent_approvals.filter(
        (list) => list.status !== 1
      );
      const receivedApprovals = response.received_approvals.filter(
        (list) => list.status !== 1
      );
      dispatch(updateReceivedPpprovals(receivedApprovals));
      dispatch(updateSentApprovals(sentApprovals));
    }
    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  const tradeApprovalRespond = useCallback(
    async (approval_id: number, status: number) => {
      changeLoading(true);
      const response = await postTradeApprovalRespondApi(
        approval_id,
        status,
        profile.profile.id
      );

      if (response !== undefined) {
        approvalSeetalert(response.message);
      }
      changeLoading(false);
    },
    [changeLoading, profile.profile.id]
  );

  return {
    memorizeApprovalReceivedApprovals,
    memorizeApprovalSentApprovals,
    getApprovalsList,
    requestApprovals,
    tradeApprovalRespond,
  };
};

export default useApprovals;
