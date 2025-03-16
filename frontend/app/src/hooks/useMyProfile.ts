import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profile";
import { type RootState } from "../store";
import { setProfile } from "../store/profileSlice";

type useMyProfileReturn = {
  profile: profileType;
};

const useMyProfile = (): useMyProfileReturn => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const memorizeProfile = useMemo(() => {
    return profile;
  }, [profile]);

  const updateProfileHandler = useCallback(() => {
    // dispatch(setProfile());
  }, []);

  return {
    profile: memorizeProfile,
  };
};

export default useMyProfile;
