import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileType } from "../types/profile";

type initialStateType = {
  profile: profileType;
};
const initialState: initialStateType = {
  profile: {
    image: "",
    old: 0,
    tag: [],
    favoriteShop: {
      name: "",
      url: "",
    },
  },
};

export const profileSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<profileType>) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = profileSlice.actions;

export default profileSlice.reducer;
