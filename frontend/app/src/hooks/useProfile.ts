import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profileType";
import { type RootState } from "../store";
import { itemListType } from "../types/itemType";
import { getProfileApi, cancellationProcessApi } from "../api/profileApis";
import { setProfile } from "../store/profileSlice";
import { setProfile as setSliceProfile } from "../store/usersSlice";
import { itemLikeApi } from "../api/likeApi";
import useAlert from "./useAlert";
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
  getProfile: (userNumver: number, myUserNumber: number) => Promise<void>;
  favoriteUpdateHandler: (itemId: string, userId: string) => Promise<void>;
  cancellationProcess: () => Promise<string>;
};

const useMyProfile = (): useMyProfileReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const { favoriteAlert } = useAlert();
  const profile = useSelector((state: RootState) => state.profile);

  const memorizeProfile = useMemo(() => {
    return profile;
  }, [profile]);

  const userProfile = useSelector((state: RootState) => state.users);

  const memorizeuserProfile = useMemo(() => {
    return userProfile;
  }, [userProfile]);

  const getMyProfile = useCallback(async () => {
    if (Number(profile.profile.id) === 0) return;
    changeLoading(true);
    const responseProfile = await getProfileApi(Number(profile.profile.id));
    if (responseProfile !== undefined) {
      dispatch(
        setProfile({
          profile: responseProfile.profile,
          items: responseProfile.items,
        })
      );
    }

    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  const getProfile = useCallback(
    async (userNumver: number, myUserNumber: number) => {
      const response = await getProfileApi(userNumver, myUserNumber);
      if (response !== undefined) {
        dispatch(
          setSliceProfile({ profile: response.profile, items: response.items })
        );
      }
    },
    [dispatch]
  );

  const favoriteUpdateHandler = useCallback(
    async (itemId: string, userId: string) => {
      const response = await itemLikeApi(itemId, userId);

      if (response !== undefined) {
        const item_id = Number(itemId);

        const newLikes = response.liked
          ? memorizeProfile.profile.likes.includes(item_id)
            ? memorizeProfile.profile.likes
            : [...memorizeProfile.profile.likes, item_id]
          : memorizeProfile.profile.likes.filter((id) => id !== item_id);

        dispatch(
          setProfile({
            profile: {
              ...memorizeProfile.profile,
              likes: newLikes,
            },
            items: memorizeProfile.items,
          })
        );

        favoriteAlert(response.message);
      }
    },
    [dispatch, favoriteAlert, memorizeProfile.items, memorizeProfile.profile]
  );

  // 退会処理
  const cancellationProcess = useCallback(async () => {
    const userId = memorizeProfile.profile.id;
    const response = await cancellationProcessApi(userId);
    if (response !== undefined) {
      return response;
    }
  }, [memorizeProfile.profile.id]);

  return {
    memorizeuserProfile,
    memorizeProfile,
    getMyProfile,
    getProfile,
    favoriteUpdateHandler,
    cancellationProcess,
  };
};

export default useMyProfile;
