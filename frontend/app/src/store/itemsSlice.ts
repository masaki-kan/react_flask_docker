import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { itemListType } from "../types/item";
import { tagType } from "../types/listTye";

type initialStateType = {
  itemsList: itemListType[];
  itemsTagList: tagType[];
  selectedTag: tagType[];
};
const initialState: initialStateType = {
  itemsList: [],
  itemsTagList: [],
  selectedTag: [],
};

export const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
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

export const { setItemsList, setItemsTagList, setSelectedTag } =
  itemsSlice.actions;

export default itemsSlice.reducer;
