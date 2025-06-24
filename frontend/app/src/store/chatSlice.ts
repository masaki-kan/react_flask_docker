import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messagesType, chatItemDataType } from "./../types/chatType";

type initialStateType = {
  messages: messagesType[];
  itemData: chatItemDataType;
  chatHight: string;
};

const initialState: initialStateType = {
  messages: [],
  itemData: {
    trade_id: "",
    item_id: 0,
    title: "",
    description: "",
    type: "",
    brand: { key: "", name: "" },
    images: [],
    user_id: 0,
    profile_image: "",
    seller_name: "",
    status: "",
  },
  chatHight: "",
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    updateMessages: (state, action: PayloadAction<messagesType[]>) => {
      state.messages = action.payload;
    },
    updateItemData: (state, action: PayloadAction<chatItemDataType>) => {
      state.itemData = action.payload;
    },
    updateChatHight: (state, action: PayloadAction<string>) => {
      state.chatHight = action.payload;
    },
  },
});

export const { updateMessages, updateItemData, updateChatHight } =
  chatSlice.actions;

export default chatSlice.reducer;
