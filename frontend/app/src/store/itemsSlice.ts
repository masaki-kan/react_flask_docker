import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { itemListType } from "../types/itemType";
import { tagType } from "../types/listType";

type initialStateType = {
  originalItemsList: itemListType[];
  itemsList: itemListType[];
  itemsTagList: tagType[];
  selectedTag: tagType[];
  itemsSearchTypeSelect: string;
  itemsSearchBrandsSelect: {
    key: string;
    name: string;
  };
};
const initialState: initialStateType = {
  originalItemsList: [],
  itemsList: [],
  itemsTagList: [],
  selectedTag: [],
  itemsSearchTypeSelect: "",
  itemsSearchBrandsSelect: {
    key: "",
    name: "",
  },
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
    setItemsSearchTypeSelect: (state, action: PayloadAction<string>) => {
      state.itemsSearchTypeSelect = action.payload;
    },
    setItemsSearchBrandsSelect: (
      state,
      action: PayloadAction<{
        key: string;
        name: string;
      }>
    ) => {
      state.itemsSearchBrandsSelect = action.payload;
    },
  },
});

export const {
  setOriginalItemsList,
  setItemsList,
  setItemsTagList,
  setSelectedTag,
  setItemsSearchTypeSelect,
  setItemsSearchBrandsSelect,
} = itemsSlice.actions;

export default itemsSlice.reducer;
