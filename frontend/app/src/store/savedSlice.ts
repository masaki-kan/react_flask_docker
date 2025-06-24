import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { savedListType } from "../types/savedType";

type initialStateType = {
  saveList: savedListType[];
  originalSaveList: savedListType[];
  checkArray: {
    tradeId: number;
    isNew: boolean;
  }[];
};
const initialState: initialStateType = {
  saveList: [],
  originalSaveList: [],
  checkArray: [],
};

export const savedSlice = createSlice({
  name: "saved",
  initialState,
  reducers: {
    setSaveList: (state, action: PayloadAction<savedListType[]>) => {
      state.saveList = action.payload;
    },
    setCheckArray: (
      state,
      action: PayloadAction<
        {
          tradeId: number;
          isNew: boolean;
        }[]
      >
    ) => {
      state.checkArray = action.payload;
    },
  },
});

export const { setSaveList, setCheckArray } = savedSlice.actions;

export default savedSlice.reducer;
