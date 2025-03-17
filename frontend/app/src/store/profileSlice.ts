import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileType } from "../types/profile";

type initialStateType = {
  profile: profileType;
};
const initialState: initialStateType = {
  profile: {
    image: "",
    name: "",
    location: "",
    old: 0,
    age: 0,
    tag: [],
    favoriteShop: {
      name: "",
      url: "",
    },
    reasen: "",
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
