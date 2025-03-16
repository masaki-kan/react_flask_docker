import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import itemsReducer from "./itemsSlice";
import profileReducer from "./profileSlice";

const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
    profile: profileReducer,
  },
});

// RootState 型を定義します。これは全アプリケーションの state の型です。
export type RootState = ReturnType<typeof store.getState>;

// store.dispatch の型をエクスポートすることも一般的です。
export type AppDispatch = typeof store.dispatch;

export default store;
