import React, { FC, useEffect, useCallback, useState } from "react";
import AuthContext from "./authContext";
import { useDispatch } from "react-redux";
import {
  deleteProfile,
  setLoginAfterProfile,
  setLoginAdminAfterProfile,
  deleteAdminProfile,
} from "../store/profileSlice";
import { TokenManager } from "../utils/auth/tokenUtils";

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setAdminIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時にトークンをチェック
  useEffect(() => {
    // 通常ユーザーのトークンチェック（有効性も含めて）
    if (TokenManager.isValidUserToken()) {
      const { token, username, userId } = TokenManager.getUserTokens();
      if (token && username && userId) {
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
    } else {
      // 無効なトークンは削除
      TokenManager.clearUserTokens();
    }

    // 管理者のトークンチェック（有効性も含めて）
    if (TokenManager.isValidAdminToken()) {
      const { token, username, userId } = TokenManager.getAdminTokens();
      if (token && username && userId) {
        setAdminIsLoggedIn(true);
        dispatch(
          setLoginAdminAfterProfile({
            profile: {
              id: userId,
              name: username,
            },
          })
        );
      }
    } else {
      // 無効なトークンは削除
      TokenManager.clearAdminTokens();
    }

    setIsLoading(false);
  }, [dispatch]);

  const login = useCallback(
    (user: string, token: string, userId: string, type: string) => {
      // セキュアストレージに保存
      TokenManager.saveUserTokens(user, token, userId, type);

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

  const adminLogin = useCallback(
    (user: string, token: string, userId: string, type: string) => {
      // セキュアストレージに保存
      TokenManager.saveAdminTokens(user, token, userId, type);

      // Reduxストアに保存
      dispatch(
        setLoginAdminAfterProfile({
          profile: {
            id: userId.toString(),
            name: user,
          },
        })
      );

      // ログイン状態を更新
      setAdminIsLoggedIn(true);
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    // セキュアストレージから削除
    TokenManager.clearUserTokens();

    // Reduxストアから削除
    dispatch(deleteProfile());

    // ログイン状態を更新
    setIsLoggedIn(false);
  }, [dispatch]);

  const adminLogout = useCallback(() => {
    // セキュアストレージから削除
    TokenManager.clearAdminTokens();

    // Reduxストアから削除
    dispatch(deleteAdminProfile());

    // ログイン状態を更新
    setAdminIsLoggedIn(false);
  }, [dispatch]);

  // ローディング中は何も表示しない
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdminLoggedIn,
        login,
        adminLogin,
        logout,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
