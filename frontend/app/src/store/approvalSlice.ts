import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tradeApprovalListType } from "./../types/approvalType";

type initialStateType = {
  receivedApprovals: tradeApprovalListType[];
  sentApprovals: tradeApprovalListType[];
};

const initialState: initialStateType = {
  receivedApprovals: [],
  sentApprovals: [],
};

export const approvalSlice = createSlice({
  name: "approval",
  initialState,
  reducers: {
    updateReceivedPpprovals: (
      state,
      action: PayloadAction<tradeApprovalListType[]>
    ) => {
      state.receivedApprovals = action.payload;
    },
    updateSentApprovals: (
      state,
      action: PayloadAction<tradeApprovalListType[]>
    ) => {
      state.sentApprovals = action.payload;
    },
  },
});

export const { updateReceivedPpprovals, updateSentApprovals } =
  approvalSlice.actions;

export default approvalSlice.reducer;
