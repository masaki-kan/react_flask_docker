import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { route } from "../route/routeConst";

const useLog = () => {
  const navigate = useNavigate();

  const logOutHandler = useCallback(() => {
    navigate(route.login);
  }, [navigate]);

  return {
    logOutHandler,
  };
};

export default useLog;
