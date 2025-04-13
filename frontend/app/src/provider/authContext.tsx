import { createContext, useContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (user: string, token: string, userId: string) => void;
  logout: () => void;
}

// 初期値を設定して AuthContext を作成
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// Context を使用するためのカスタムフック
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
