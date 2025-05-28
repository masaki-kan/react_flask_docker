import React, { FC, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./authContext"; // AuthContext のインポート
import { useDispatch } from "react-redux";
import { deleteProfile, setLoginAfterProfile } from "../store/profileSlice";
import useLaoding from "../hooks/useLaoding";

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispath = useDispatch();
  const navigate = useNavigate();
  const { changeLoading, memorizeLoading } = useLaoding();

  const login = useCallback(
    (user: string, token: string, userId: string) => {
      localStorage.setItem("token", token);
      dispath(
        setLoginAfterProfile({ profile: { id: userId.toString(), name: user } })
      );
    },
    [dispath]
  );

  const logout = useCallback(() => {
    dispath(deleteProfile());
    localStorage.removeItem("token");
  }, [dispath]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      navigate("/login"); // ログインページへのルートを直接指定
    }
  }, [changeLoading, logout, navigate]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: memorizeLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
