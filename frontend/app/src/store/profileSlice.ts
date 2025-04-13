import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileType } from "../types/profile";
import { itemListType } from "../types/item";

type initialStateType = {
  profile: profileType;
  items: itemListType[];
  isLoggedIn: boolean;
};
const initialState: initialStateType = {
  profile: {
    id: "",
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
  isLoggedIn: false,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (
      state,
      action: PayloadAction<{ profile: profileType; items: itemListType[] }>
    ) => {
      state.profile = action.payload.profile;
      state.items = action.payload.items;
    },
    setUserProfile: (
      state,
      action: PayloadAction<{ profile: profileType; items: itemListType[] }>
    ) => {
      state.profile = action.payload.profile;
      state.items = action.payload.items;
    },
    deleteProfile: (state) => {
      state.profile = initialState.profile; // 初期プロフィールにリセット
      state.items = initialState.items; // 初期アイテムリストにリセット
    },
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setLoginAfterProfile: (
      state,
      action: PayloadAction<{ profile: { id: string; name: string } }>
    ) => {
      state.profile = {
        ...state.profile,
        id: action.payload.profile.id,
        name: action.payload.profile.name,
      };
    },
  },
});

export const {
  setProfile,
  setUserProfile,
  deleteProfile,
  setIsLoggedIn,
  setLoginAfterProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
