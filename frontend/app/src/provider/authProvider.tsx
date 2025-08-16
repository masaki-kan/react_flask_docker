import React, { FC, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./authContext";
import { useDispatch } from "react-redux";
import { deleteProfile, setLoginAfterProfile } from "../store/profileSlice";
import useLaoding from "../hooks/useLaoding";

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { memorizeLoading } = useLaoding();

  const login = useCallback(
    (user: string, token: string, userId: string) => {
      localStorage.setItem("token", token);
      dispatch(
        setLoginAfterProfile({ profile: { id: userId.toString(), name: user } })
      );
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    dispatch(deleteProfile());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // トークンがない場合は、ログアウト処理をしてホームページへリダイレクト
    if (!token) {
      logout();
      navigate("/");
    }
  }, [logout, navigate]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: memorizeLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
