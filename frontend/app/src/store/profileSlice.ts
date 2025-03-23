import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileType } from "../types/profile";
import { itemListType } from "../types/item";

type initialStateType = {
  profile: profileType;
  items: itemListType[];
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
  items: [],
};

export const profileSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setProfile: (
      state,
      action: PayloadAction<{ profile: profileType; items: itemListType[] }>
    ) => {
      state.profile = action.payload.profile;
      state.items = action.payload.items;
    },
  },
});

export const { setProfile } = profileSlice.actions;

export default profileSlice.reducer;
