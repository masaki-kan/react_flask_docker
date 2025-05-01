import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profile";
import { type RootState } from "../store";
import { itemListType } from "../types/item";
import { getProfileApi } from "../api/profileApis";
import { setProfile } from "../store/profileSlice";
import { setProfile as setSliceProfile } from "../store/usersSlice";
import useLoading from "./useLaoding";

type useMyProfileReturn = {
  memorizeProfile: {
    profile: profileType;
    items: itemListType[];
  };
  memorizeuserProfile: {
    profile: profileType;
    items: itemListType[];
  };
  getMyProfile: () => Promise<void>;
  getUserProfile: () => { profile: profileType; items: itemListType[] };
  getProfile: (userNumver: string, myUserNumber: string) => Promise<void>;
};

const useMyProfile = (): useMyProfileReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const profile = useSelector((state: RootState) => state.profile);

  const memorizeProfile = useMemo(() => {
    return profile;
  }, [profile]);

  const userProfile = useSelector((state: RootState) => state.users);

  const memorizeuserProfile = useMemo(() => {
    return userProfile;
  }, [userProfile]);

  const getMyProfile = useCallback(async () => {
    changeLoading(true);
    const response = await getProfileApi(profile.profile.id);

    if (response !== undefined) {
      console.log("getMyProfile getMyProfile", response);
      dispatch(
        setProfile({ profile: response.profile, items: response.items })
      );
    }
    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  const getProfile = useCallback(
    async (userNumver: string, myUserNumber: string) => {
      const response = await getProfileApi(userNumver, myUserNumber);
      console.log("getMyProfile getProfile", response);
      if (response !== undefined) {
        dispatch(
          setSliceProfile({ profile: response.profile, items: response.items })
        );
      }
    },
    [dispatch]
  );

  const getUserProfile = useCallback((): {
    profile: profileType;
    items: itemListType[];
  } => {
    const profileDate = profile.profile;
    const items = profile.items;

    return {
      profile: profileDate,
      items,
    };
  }, [profile.items, profile.profile]);

  return {
    memorizeuserProfile,
    memorizeProfile,
    getMyProfile,
    getUserProfile,
    getProfile,
  };
};

export default useMyProfile;
