import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { followListType, tagType } from "../types/listTye";

type initialStateType = {
  userList: followListType[];
  followLists: followListType[];
  followersList: followListType[];
  selectedTag: tagType[];
  tagList: tagType[];
};
const initialState: initialStateType = {
  userList: [],
  followLists: [],
  followersList: [],
  selectedTag: [],
  tagList: [],
};

export const listingSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUserList: (state, action: PayloadAction<followListType[]>) => {
      state.userList = action.payload;
    },
    setTagList: (state, action: PayloadAction<tagType[]>) => {
      state.tagList = action.payload;
    },
    setFollowList: (state, action: PayloadAction<followListType[]>) => {
      state.followLists = action.payload;
    },
    setFollowersList: (state, action: PayloadAction<followListType[]>) => {
      state.followersList = action.payload;
    },
    setSelectedTag: (state, action: PayloadAction<tagType[]>) => {
      state.selectedTag = action.payload;
    },
  },
});

export const {
  setUserList,
  setTagList,
  setFollowList,
  setFollowersList,
  setSelectedTag,
} = listingSlice.actions;

export default listingSlice.reducer;
