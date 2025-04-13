import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
  load: boolean;
};

const initialState: initialStateType = {
  load: false,
};

export const loadingSlice = createSlice({
  name: "load",
  initialState,
  reducers: {
    updateLoad: (state, action: PayloadAction<boolean>) => {
      state.load = action.payload;
    },
  },
});

export const { updateLoad } = loadingSlice.actions;

export default loadingSlice.reducer;
