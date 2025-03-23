import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profile";
import { type RootState } from "../store";
import { setProfile } from "../store/profileSlice";
import { itemListType } from "../types/item";
import { genres } from "../consts/profileGenreConsts";

type useMyProfileReturn = {
  memorizeProfile: {
    profile: profileType;
    items: itemListType[];
  };
  getMyProfile: () => void;
  updateProfileHandler: () => void;
};

const useMyProfile = (): useMyProfileReturn => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
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
      tag: [
        { tagKey: genres[0].brandKey, tagName: genres[1].brandName },
        { tagKey: genres[5].brandKey, tagName: genres[5].brandName },
        { tagKey: genres[6].brandKey, tagName: genres[6].brandName },
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
        itemName: "Vintage 70s Navy Blue Wool Coa ",
        description: "",
        price: 8500,
        currency: "¥",
        type: { typeKey: 0, typeName: "ジャケット" },
        brand: { brandKey: 0, brandName: "90's" },
        image:
          "https://cdn.usegalileo.ai/sdxl10/b7dd176c-c822-4e72-998e-9b1575310749.png",
      },
      {
        itemName: "Vintage 90s Black &amp; White Striped Tee",
        price: 5000,
        currency: "¥",
        description: "",
        type: { typeKey: 0, typeName: "ジャケット" },
        brand: { brandKey: 0, brandName: "90's" },
        image:
          "https://cdn.usegalileo.ai/sdxl10/4f6e9eb1-9d0e-4435-9600-d63646766c03.png",
      },
    ];

    dispatch(setProfile({ profile: profileDate, items }));
  }, [dispatch]);

  const updateProfileHandler = useCallback(() => {}, []);

  return {
    memorizeProfile,
    getMyProfile,
    updateProfileHandler,
  };
};

export default useMyProfile;
