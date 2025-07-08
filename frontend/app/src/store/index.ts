import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import usersReducer from "./usersSlice";
import itemsReducer from "./itemsSlice";
import savedReducer from "./savedSlice";
import profileReducer from "./profileSlice";
import loadingReducer from "./loadingSlice";
import navigationReducer from "./navigationSlice";
import chatReducer from "./chatSlice";
import approvalReducer from "./approvalSlice";

const persistConfig = {
  key: "profile",
  storage: storage,
  whitelist: ["profile"], // profileSlice のみ永続化
};

const persistedProfileReducer = persistReducer(persistConfig, profileReducer);

const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
    profile: persistedProfileReducer,
    saved: savedReducer,
    load: loadingReducer,
    navigation: navigationReducer,
    chat: chatReducer,
    approval: approvalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist の非シリアライズ可能な action を許可
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

// RootState 型を定義します。これは全アプリケーションの state の型です。
export type RootState = ReturnType<typeof store.getState>;

// store.dispatch の型をエクスポートすることも一般的です。
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
