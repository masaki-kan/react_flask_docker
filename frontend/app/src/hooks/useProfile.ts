import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profile";
import { type RootState } from "../store";
import { itemListType } from "../types/item";
import { genres } from "../consts/profileGenreConsts";
import { getMyProfileApi } from "../../api/profileApis";
import { setProfile } from "../store/profileSlice";

type useMyProfileReturn = {
  memorizeProfile: {
    profile: profileType;
    items: itemListType[];
  };
  getMyProfile: () => Promise<void>;
  getUserProfile: () => { profile: profileType; items: itemListType[] };
};

const useMyProfile = (): useMyProfileReturn => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const memorizeProfile = useMemo(() => {
    return profile;
  }, [profile]);

  const getMyProfile = useCallback(async () => {
    const response = await getMyProfileApi(profile.profile.id);

    if (response !== undefined) {
      const profileDate = {
        id: profile.profile.id,
        image: response.profile.image,
        name: response.profile.name,
        location: response.profile.location,
        old: response.profile.old,
        tag: response.profile.tag,
        age: response.profile.age,
        favoriteShop: response.profile.favoriteShop,
        reasen: response.profile.reasen,
      };

      const items = response.items;

      dispatch(setProfile({ profile: profileDate, items }));
    }
  }, [dispatch, profile]);

  const getUserProfile = useCallback((): {
    profile: profileType;
    items: itemListType[];
  } => {
    const profileDate = {
      id: "1",
      image:
        "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      name: "Personal Information(User Name)",
      location: "大阪",
      old: 30,
      tag: [
        { key: genres[0].brandKey, name: genres[1].brandName },
        { key: genres[5].brandKey, name: genres[5].brandName },
        { key: genres[6].brandKey, name: genres[6].brandName },
      ],
      age: 2,
      favoriteShop: {
        name: "KINJI BIGSTEP 心斎橋店 ",
        url: "https://www.instagram.com/kinji_bigstep/",
      },
      reasen: "初期テスト文章",
    };

    const items = [
      {
        title: "Vintage 70s Navy Blue Wool Coa ",
        description: "",
        price: 8500,
        currency: "¥",
        type: { key: "0", name: "ジャケット" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/b7dd176c-c822-4e72-998e-9b1575310749.png",
          "https://cdn.usegalileo.ai/sdxl10/4f6e9eb1-9d0e-4435-9600-d63646766c03.png",
        ],
      },
      {
        title: "Vintage 90s Black &amp; White Striped Tee",
        price: 5000,
        currency: "¥",
        description: "",
        type: { key: "0", name: "ジャケット" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/4f6e9eb1-9d0e-4435-9600-d63646766c03.png",
          "https://cdn.usegalileo.ai/sdxl10/b7dd176c-c822-4e72-998e-9b1575310749.png",
        ],
      },
    ];

    return {
      profile: profileDate,
      items,
    };
  }, []);

  return {
    memorizeProfile,
    getMyProfile,
    getUserProfile,
  };
};

export default useMyProfile;
