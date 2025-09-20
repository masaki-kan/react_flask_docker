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
import { useUserProfile } from "../hooks/useUserProfile";

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setAdminIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { autoFetchProfile, resetProfile } = useUserProfile();

  // 初回マウント時にトークンをチェック
  useEffect(() => {
    const initializeAuth = async () => {
      // 通常ユーザーのトークンチェック（有効性も含めて）
      if (TokenManager.isValidUserToken()) {
        setIsLoggedIn(true);
        // プロフィール情報はAPIから取得
        const profile = await autoFetchProfile();
        if (profile) {
          dispatch(
            setLoginAfterProfile({
              profile: {
                id: profile.user_id.toString(),
                name: profile.name,
              },
            })
          );
        }
      } else {
        // 無効なトークンは削除
        TokenManager.clearUserToken();
      }

      // 管理者のトークンチェック（有効性も含めて）
      if (TokenManager.isValidAdminToken()) {
        setAdminIsLoggedIn(true);
        // 管理者プロフィール情報はAPIから取得
        const adminProfile = await autoFetchProfile();
        if (adminProfile) {
          dispatch(
            setLoginAdminAfterProfile({
              profile: {
                id: adminProfile.user_id.toString(),
                name: adminProfile.name,
              },
            })
          );
        }
      } else {
        // 無効なトークンは削除
        TokenManager.clearAdminToken();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [dispatch, autoFetchProfile]);

  const login = useCallback(
    async (user: string, token: string, userId: string) => {
      // トークンのみ保存
      TokenManager.saveUserToken(token);

      // Reduxストアに基本情報保存
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

      // プロフィール情報をAPIから取得
      await autoFetchProfile();
    },
    [dispatch, autoFetchProfile]
  );

  const adminLogin = useCallback(
    async (user: string, token: string, userId: string) => {
      // 管理者トークンのみ保存
      TokenManager.saveAdminToken(token);

      // Reduxストアに基本情報保存
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

      // 管理者プロフィール情報をAPIから取得
      await autoFetchProfile();
    },
    [dispatch, autoFetchProfile]
  );

  const logout = useCallback(() => {
    // トークンを削除
    TokenManager.clearUserToken();

    // プロフィール情報をリセット
    resetProfile();

    // Reduxストアから削除
    dispatch(deleteProfile());

    // ログイン状態を更新
    setIsLoggedIn(false);
  }, [dispatch, resetProfile]);

  const adminLogout = useCallback(() => {
    // 管理者トークンを削除
    TokenManager.clearAdminToken();

    // プロフィール情報をリセット
    resetProfile();

    // Reduxストアから削除
    dispatch(deleteAdminProfile());

    // ログイン状態を更新
    setAdminIsLoggedIn(false);
  }, [dispatch, resetProfile]);

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
