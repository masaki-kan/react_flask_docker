import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { route } from "../route/routeConst";
import { useAuth } from "../provider/authContext";

const useLog = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logOutHandler = useCallback(() => {
    logout();
    navigate(route.login);
  }, [logout, navigate]);

  return {
    logOutHandler,
  };
};

export default useLog;
