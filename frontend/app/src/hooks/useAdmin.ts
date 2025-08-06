// hooks/useAdmin.ts
import { useSelector } from "react-redux";
import { RootState } from "../store";

const useAdmin = () => {
  const profile = useSelector((state: RootState) => state.profile);

  const isAdmin = profile.profile.type === 0;

  return { isAdmin };
};

export default useAdmin;
