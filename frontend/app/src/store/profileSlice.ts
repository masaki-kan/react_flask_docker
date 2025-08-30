import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileType } from "../types/profileType";
import { itemListType } from "../types/itemType";
import { exchangeArchive } from "../types/archiveTradeType";

type initialStateType = {
  profile: profileType;
  items: itemListType[];
  archive: exchangeArchive[];
  userArchive: exchangeArchive[];
  loading: {
    profile: boolean;
    items: boolean;
    archive: boolean;
  };
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
    likes: [],
    plan: "0",
    type: 0,
    is_deleted: 0,
    deleted_at: null,
    email: "",
  },
  items: [],
  archive: [],
  userArchive: [],
  loading: {
    profile: false,
    items: false,
    archive: false,
  },
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
      state.loading.profile = false;
      state.loading.items = false;
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
    setProfileArchives: (state, action: PayloadAction<exchangeArchive[]>) => {
      state.archive = action.payload;
    },
    setUserArchives: (state, action: PayloadAction<exchangeArchive[]>) => {
      state.userArchive = action.payload;
    },
  },
});

export const {
  setProfile,
  setUserProfile,
  deleteProfile,
  setLoginAfterProfile,
  setProfileArchives,
  setUserArchives,
} = profileSlice.actions;

export default profileSlice.reducer;
