import React, { FC, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./authContext"; // AuthContext のインポート
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  deleteProfile,
  setIsLoggedIn,
  setLoginAfterProfile,
} from "../store/profileSlice";

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispath = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();

  const login = useCallback(
    (user: string, token: string, userId: string) => {
      localStorage.setItem("token", token);
      dispath(setIsLoggedIn(true));
      dispath(
        setLoginAfterProfile({ profile: { id: userId.toString(), name: user } })
      );
    },
    [dispath]
  );

  const logout = useCallback(() => {
    dispath(deleteProfile());
    dispath(setIsLoggedIn(false));
    localStorage.removeItem("token");
  }, [dispath]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      logout();
      navigate("/login"); // ログインページへのルートを直接指定
    }
  }, [logout, navigate]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: profile.isLoggedIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
