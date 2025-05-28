import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  previousUrl: "",
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setPreviousUrl(state, action: PayloadAction<string>) {
      state.previousUrl = action.payload;
    },
  },
});

export const { setPreviousUrl } = navigationSlice.actions;
export default navigationSlice.reducer;
