import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  messagesType,
  chatItemDataType,
  shippingInfoType,
  confirmationType,
  userDataType,
} from "./../types/chatType";

type initialStateType = {
  messages: messagesType[];
  itemData: chatItemDataType;
  chatHight: string;
  partnerItems: chatItemDataType[];
  shippingInfo: shippingInfoType[];
  confirmations: confirmationType[];
  sellerUserData: userDataType;
  buyerUserData: userDataType;
};

const initialStateUserData = {
  age: 0,
  location: "",
  name: "",
  old: 0,
  profile_image: "",
  reasen: "",
  shop_name: "",
  shop_url: "",
  tags: [],
  user_id: 0,
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
    user_name: "",
    status: "",
  },
  chatHight: "",
  partnerItems: [],
  shippingInfo: [],
  confirmations: [],
  sellerUserData: initialStateUserData,
  buyerUserData: initialStateUserData,
};

// 一度にページデータを更新するための型
type ChatPageDataPayload = {
  messages: messagesType[];
  itemData: chatItemDataType | null;
  partnerItems: chatItemDataType[];
  shippingInfo: shippingInfoType[];
  confirmations: confirmationType[];
  sellerUserData: userDataType | null;
  buyerUserData: userDataType | null;
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    updateItemData: (state, action: PayloadAction<chatItemDataType>) => {
      state.itemData = action.payload;
    },
    updateChatHight: (state, action: PayloadAction<string>) => {
      state.chatHight = action.payload;
    },
    updateShippingInfo: (state, action: PayloadAction<shippingInfoType[]>) => {
      state.shippingInfo = action.payload;
    },
    updateConfirmations: (state, action: PayloadAction<confirmationType[]>) => {
      state.confirmations = action.payload;
    },
    // 🔥 新しいアクション: 一度にすべてのページデータを更新
    updateChatPageData: (state, action: PayloadAction<ChatPageDataPayload>) => {
      const {
        messages,
        itemData,
        partnerItems,
        shippingInfo,
        confirmations,
        sellerUserData,
        buyerUserData,
      } = action.payload;

      state.messages = messages;
      if (itemData) {
        state.itemData = itemData;
      }
      state.partnerItems = partnerItems;
      state.shippingInfo = shippingInfo;
      state.confirmations = confirmations;
      if (sellerUserData) {
        state.sellerUserData = sellerUserData;
      }
      if (buyerUserData) {
        state.buyerUserData = buyerUserData;
      }
    },
    // チャットの初期化
    resetChatData: (state) => {
      state.messages = [];
      state.itemData = initialState.itemData;
      state.partnerItems = [];
      state.shippingInfo = [];
      state.confirmations = [];
    },
  },
});

export const {
  updateItemData,
  updateChatHight,
  updateShippingInfo,
  updateConfirmations,
  updateChatPageData, // 🔥 新しいアクションをエクスポート
  resetChatData,
} = chatSlice.actions;

export default chatSlice.reducer;
