import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { followListType, tagType } from "../types/listType";
import { profileType } from "../types/profileType";
import { itemListType } from "../types/itemType";

type initialStateType = {
  originalData: followListType[];
  userList: followListType[];
  selectedTag: tagType[];
  tagList: tagType[];
  profile: profileType;
  items: itemListType[];
};
const initialState: initialStateType = {
  originalData: [],
  userList: [],
  selectedTag: [],
  tagList: [],
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
    is_following: false,
    likes: [],
    plan: "1",
  },
  items: [],
};

export const listingSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setOriginalData: (state, action: PayloadAction<followListType[]>) => {
      state.originalData = action.payload;
    },
    setUserList: (state, action: PayloadAction<followListType[]>) => {
      state.userList = action.payload;
    },
    setTagList: (state, action: PayloadAction<tagType[]>) => {
      state.tagList = action.payload;
    },
    setSelectedTag: (state, action: PayloadAction<tagType[]>) => {
      state.selectedTag = action.payload;
    },
    setProfile: (
      state,
      action: PayloadAction<{ profile: profileType; items: itemListType[] }>
    ) => {
      state.profile = action.payload.profile;
      state.items = action.payload.items;
    },
  },
});

export const {
  setOriginalData,
  setUserList,
  setTagList,
  setSelectedTag,
  setProfile,
} = listingSlice.actions;

export default listingSlice.reducer;
