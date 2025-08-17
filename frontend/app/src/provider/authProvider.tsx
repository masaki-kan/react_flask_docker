import React, { FC, useEffect, useCallback, useState } from "react";
import AuthContext from "./authContext";
import { useDispatch } from "react-redux";
import { deleteProfile, setLoginAfterProfile } from "../store/profileSlice";

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時にトークンをチェック
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    if (token && username && userId) {
      // トークンがある場合はログイン状態を復元
      setIsLoggedIn(true);
      dispatch(
        setLoginAfterProfile({
          profile: {
            id: userId,
            name: username,
          },
        })
      );
    }

    setIsLoading(false);
  }, [dispatch]);

  const login = useCallback(
    (user: string, token: string, userId: string) => {
      // LocalStorageに保存
      localStorage.setItem("token", token);
      localStorage.setItem("username", user);
      localStorage.setItem("userId", userId);

      // Reduxストアに保存
      dispatch(
        setLoginAfterProfile({
          profile: {
            id: userId.toString(),
            name: user,
          },
        })
      );

      // ログイン状態を更新
      setIsLoggedIn(true);
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    // LocalStorageから削除
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    // Reduxストアから削除
    dispatch(deleteProfile());

    // ログイン状態を更新
    setIsLoggedIn(false);
  }, [dispatch]);

  // ローディング中は何も表示しない
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
