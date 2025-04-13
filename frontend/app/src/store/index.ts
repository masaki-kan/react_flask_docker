import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import usersReducer from "./usersSlice";
import itemsReducer from "./itemsSlice";
import savedReducer from "./savedSlice";
import profileReducer from "./profileSlice";
import loadingReducer from "./loadingSlice";

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
  },
});

const persistor = persistStore(store);

// RootState 型を定義します。これは全アプリケーションの state の型です。
export type RootState = ReturnType<typeof store.getState>;

// store.dispatch の型をエクスポートすることも一般的です。
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
