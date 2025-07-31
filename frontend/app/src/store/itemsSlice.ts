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
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
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
  currentPage: 1,
  hasMore: true,
  isLoading: false,
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
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    appendItemsList: (state, action: PayloadAction<itemListType[]>) => {
      state.itemsList = [...state.itemsList, ...action.payload];
      state.originalItemsList = [...state.originalItemsList, ...action.payload];
    },
    resetItemsList: (state) => {
      state.itemsList = [];
      state.originalItemsList = [];
      state.currentPage = 1;
      state.hasMore = true;
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
  resetItemsList,
  setCurrentPage,
  setHasMore,
  setIsLoading,
  appendItemsList,
} = itemsSlice.actions;

export default itemsSlice.reducer;
