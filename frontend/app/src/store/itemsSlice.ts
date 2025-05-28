import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { itemListType } from "../types/itemType";
import { tagType } from "../types/listType";

type initialStateType = {
  originalItemsList: itemListType[];
  itemsList: itemListType[];
  itemsTagList: tagType[];
  selectedTag: tagType[];
};
const initialState: initialStateType = {
  originalItemsList: [],
  itemsList: [],
  itemsTagList: [],
  selectedTag: [],
};

export const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setOriginalItemsList: (state, action: PayloadAction<itemListType[]>) => {
      state.originalItemsList = action.payload;
    },
    setItemsList: (state, action: PayloadAction<itemListType[]>) => {
      state.itemsList = action.payload;
    },
    setItemsTagList: (state, action: PayloadAction<tagType[]>) => {
      state.itemsTagList = action.payload;
    },
    setSelectedTag: (state, action: PayloadAction<tagType[]>) => {
      state.selectedTag = action.payload;
    },
  },
});

export const {
  setOriginalItemsList,
  setItemsList,
  setItemsTagList,
  setSelectedTag,
} = itemsSlice.actions;

export default itemsSlice.reducer;
