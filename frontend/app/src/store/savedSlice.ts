import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { savedListType } from "../types/savedType";

type initialStateType = {
  saveList: savedListType[];
};
const initialState: initialStateType = {
  saveList: [],
};

export const savedSlice = createSlice({
  name: "saved",
  initialState,
  reducers: {
    setSaveList: (state, action: PayloadAction<savedListType[]>) => {
      state.saveList = action.payload;
    },
  },
});

export const { setSaveList } = savedSlice.actions;

export default savedSlice.reducer;
