import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { profileType } from "../types/profileType";
import { type RootState } from "../store";
import { itemListType } from "../types/itemType";
import {
  getProfileApi,
  cancellationProcessApi,
  getProfileItemsApi,
  exchangeArchiveApi,
  purchaseArchiveApi,
  fetchArchiveDetailApi,
} from "../api/profileApis";
import {
  setProfile,
  setProfileArchives,
  setProfilePurchaseArchives,
} from "../store/profileSlice";
import { setProfile as setSliceProfile } from "../store/usersSlice";
import { itemLikeApi } from "../api/likeApi";
import useAlert from "./useAlert";
import {
  exchangeArchive,
  purchaseArchive,
  archiveMessage,
  archiveShippingInfo,
  archiveTradeType,
} from "../types/archiveTradeType";
import useLog from "./useLog";
import { systemErrorLogoutAlert } from "../utils/alert/sweetalert2";
import { useToast } from "@chakra-ui/react";

type useMyProfileReturn = {
  memorizeProfile: {
    profile: profileType;
    items: itemListType[];
  };
  memorizeuserProfile: {
    profile: profileType;
    items: itemListType[];
  };
  memorizeuserProfileArchives: exchangeArchive[];
  memorizeuserProfilePurchaseArchives: purchaseArchive[];
  getMyProfile: () => Promise<void>;
  getProfile: (userNumver: number, myUserNumber: number) => Promise<void>;
  favoriteUpdateHandler: (itemId: string, userId: string) => Promise<void>;
  cancellationProcess: () => Promise<void>;
  getArchiveDetailHandler: (archiveId: string) => Promise<
    | {
        archiveData: archiveTradeType;
        messages: archiveMessage[];
        shippingInfo: archiveShippingInfo[];
      }
    | undefined
  >;
};

const useMyProfile = (): useMyProfileReturn => {
  const { logOutHandler } = useLog();
  const dispatch = useDispatch();
  const toast = useToast();
  const { favoriteAlert, tradeAlert } = useAlert();
  const profile = useSelector((state: RootState) => state.profile);

  const memorizeProfile = useMemo(() => {
    return profile;
  }, [profile]);

  const userProfile = useSelector((state: RootState) => state.users);

  const memorizeuserProfile = useMemo(() => {
    return userProfile;
  }, [userProfile]);

  // 他のユーザーの交換履歴
  const memorizeuserProfileArchives = useMemo(() => {
    return profile.archive;
  }, [profile]);

  // 他のユーザーの購入履歴
  const memorizeuserProfilePurchaseArchives = useMemo(() => {
    return profile.archivePurchase;
  }, [profile]);

  // 自分のプロフィールデータ取得
  const getMyProfile = useCallback(async () => {
    if (Number(profile.profile.id) === 0) {
      // console.warn("Early return: profile.profile.id is 0");
      return;
    }

    const [
      responseProfile,
      responseItems,
      responseActive,
      responsePurchaseArchive,
    ] = await Promise.all([
      await getProfileApi(Number(profile.profile.id)),
      await getProfileItemsApi(Number(profile.profile.id)),
      await exchangeArchiveApi(Number(profile.profile.id)),
      await purchaseArchiveApi(Number(profile.profile.id)),
    ]);

    // もしプロフィール情報が取得できない場合はログアウトする
    if (responseProfile === undefined) {
      // console.error("Profile API failed - responseProfile is undefined");
      systemErrorLogoutAlert();
      logOutHandler();
      return;
    }

    // APIレスポンスのsuccessフィールドをチェック
    if (responseProfile && !responseProfile.success) {
      systemErrorLogoutAlert();
      logOutHandler();
      return;
    }

    // プロフィールが取得できたらすぐに更新
    if (responseProfile && responseProfile.success) {
      dispatch(
        setProfile({
          profile: responseProfile.data.profile,
          items: [], // 一旦空配列
        })
      );
    }

    //商品が取得できたら更新
    if (
      responseItems &&
      responseProfile &&
      responseProfile.success &&
      responseItems.success
    ) {
      dispatch(
        setProfile({
          profile: responseProfile.data.profile,
          items: responseItems.data.items,
        })
      );
    }
    if (responseActive && responseActive.success) {
      dispatch(setProfileArchives(responseActive.data.archives));
    }
    if (responsePurchaseArchive && responsePurchaseArchive.success) {
      dispatch(
        setProfilePurchaseArchives(responsePurchaseArchive.data.archives)
      );
    }
  }, [dispatch, logOutHandler, profile.profile.id]);

  // ユーザーのプロフィールデータ取得
  const getProfile = useCallback(
    async (userNumver: number, myUserNumber: number) => {
      const [responseProfile, responseItems] = await Promise.all([
        getProfileApi(userNumver, myUserNumber),
        getProfileItemsApi(userNumver),
      ]);

      if (responseProfile && responseProfile.success) {
        dispatch(
          setSliceProfile({
            profile: responseProfile.data.profile,
            items: [],
          })
        );
      }

      // // 商品が取得できたら更新
      if (
        responseItems &&
        responseProfile &&
        responseProfile.success &&
        responseItems.success
      ) {
        dispatch(
          setSliceProfile({
            profile: responseProfile.data.profile,
            items: responseItems.data.items,
          })
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

        if (response.success) {
          const newLikes = response.data.liked
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

          favoriteAlert(response.data.message);
        }
      }
    },
    [dispatch, favoriteAlert, memorizeProfile.items, memorizeProfile.profile]
  );

  const getArchiveDetailHandler = useCallback(
    async (
      archiveId: string
    ): Promise<
      | {
          archiveData: archiveTradeType;
          messages: archiveMessage[];
          shippingInfo: archiveShippingInfo[];
        }
      | undefined
    > => {
      const response = await fetchArchiveDetailApi(archiveId!);

      if (response.success) {
        return {
          archiveData: response.data.trade,
          messages: response.data.messages,
          shippingInfo: response.data.shipping_info,
        };
      }
    },
    []
  );

  // 退会処理
  const cancellationProcess = useCallback(async () => {
    const userId = memorizeProfile.profile.id;
    const response = await cancellationProcessApi(userId);
    if (response !== undefined) {
      if (response?.success === false) {
        toast({
          title: "退会処理エラー",
          description: response.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (response !== undefined && response.success) {
        tradeAlert(response.message).then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            logOutHandler();
          }
        });
      }
    }
  }, [logOutHandler, memorizeProfile.profile.id, toast, tradeAlert]);

  return {
    memorizeuserProfileArchives,
    memorizeuserProfilePurchaseArchives,
    memorizeuserProfile,
    memorizeProfile,
    getMyProfile,
    getProfile,
    favoriteUpdateHandler,
    cancellationProcess,
    getArchiveDetailHandler,
  };
};

export default useMyProfile;
