import { createContext, useContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  login: (user: string, token: string, userId: string, type: string) => void;
  adminLogin: (
    user: string,
    token: string,
    userId: string,
    type: string
  ) => void;
  logout: () => void;
  adminLogout: () => void;
}

// 初期値を設定して AuthContext を作成
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdminLoggedIn: false,
  adminLogin: () => {},
  login: () => {},
  logout: () => {},
  adminLogout: () => {},
});

// Context を使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
