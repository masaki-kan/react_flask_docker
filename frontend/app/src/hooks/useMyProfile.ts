import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profile";
import { type RootState } from "../store";
import { setProfile } from "../store/profileSlice";

type useMyProfileReturn = {
  memorizeProfile: profileType;
  getMyProfile: () => void;
  updateProfileHandler: () => void;
};

const useMyProfile = (): useMyProfileReturn => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const memorizeProfile = useMemo(() => {
    return profile;
  }, [profile]);

  const getMyProfile = useCallback(() => {
    const profileDate = {
      image:
        "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      name: "Personal Information(User Name)",
      location: "大阪",
      old: 30,
      tag: ["90年代", "80年代"],
      age: 2,
      favoriteShop: {
        name: "KINJI BIGSTEP 心斎橋店 ",
        url: "https://www.instagram.com/kinji_bigstep/",
      },
      reasen: "初期テスト文章",
    };

    dispatch(setProfile(profileDate));
  }, [dispatch]);

  const updateProfileHandler = useCallback(() => {}, []);

  return {
    memorizeProfile,
    getMyProfile,
    updateProfileHandler,
  };
};

export default useMyProfile;
