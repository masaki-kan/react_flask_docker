import { useCallback, useMemo } from "react";
import {
  getChatItemDetailApi,
  uploadImageApi,
  getMessagesApi,
  fetchPartnerItemsApi,
  saveShippingInfoApi,
  fetchShippingInfoApi,
  fetchConfirmationsApi,
  confirmItemReceivedApi,
} from "../api/chatApi";
import {
  chatItemDataType,
  messagesType,
  shippingInfoType,
  confirmationType,
  userDataType,
} from "../types/chatType";
import { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import {
  updateItemData,
  updateChatHight,
  updateShippingInfo,
  updateConfirmations,
  updateChatPageData, // 新しいアクション
  updateSelectsellerToBuyerItem,
} from "../store/chatSlice";
import { viewDate } from "../utils/date/format";
import useLoading from "./useLaoding";
import { trageStatusChange } from "../api/tradeApi";
import { errorSweetalert2 } from "../utils/alert/sweetalert2";

type useChatReturn = {
  memorizeChatMessages: messagesType[];
  memorizeChatItemData: chatItemDataType;
  memorizeChatHight: string;
  memorizePartnerItems: chatItemDataType[];
  memorizeShippingInfo: shippingInfoType[];
  memorizeConfirmations: confirmationType[];
  memorizeBuyerUserData: userDataType;
  memorizeSellerUserData: userDataType;
  memorizeSelectsellerToBuyerItem: chatItemDataType;
  getChatPageData: (trade_id: string) => Promise<void>;
  uploadImage: (FormData: File) => Promise<string | undefined>;
  tradeStatusChangeHandler: (trade_id: string, status: string) => Promise<void>;
  upDateChatHight: (hight: number | undefined) => void;
  saveShippingInfo: (
    tradeId: string,
    senderUserId: string,
    trackingNumber: string,
    shippingCompany: string
  ) => Promise<void>;
  confirmItemReceived: (tradeId: string, userId: string) => Promise<void>;
  updateSelectsellerToBuyerItemHandler: (item: chatItemDataType) => void;
};

const useChat = (): useChatReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const chat = useSelector((state: RootState) => state.chat);
  const profile = useSelector((state: RootState) => state.profile);

  // メモ化された値
  const memorizeChatMessages: messagesType[] = useMemo(() => {
    return chat.messages;
  }, [chat.messages]);

  // メモ化
  const memorizeChatItemData: chatItemDataType = useMemo(() => {
    return chat.itemData;
  }, [chat.itemData]);
  // メモ化
  const memorizeChatHight: string = useMemo(() => {
    return chat.chatHight;
  }, [chat.chatHight]);
  // メモ化
  const memorizePartnerItems: chatItemDataType[] = useMemo(() => {
    return chat.partnerItems;
  }, [chat.partnerItems]);
  // メモ化
  const memorizeShippingInfo: shippingInfoType[] = useMemo(() => {
    return chat.shippingInfo || [];
  }, [chat.shippingInfo]);
  // メモ化
  const memorizeConfirmations: confirmationType[] = useMemo(() => {
    return chat.confirmations || [];
  }, [chat.confirmations]);

  // メモ化
  const memorizeBuyerUserData: userDataType = useMemo(() => {
    return chat.buyerUserData;
  }, [chat.buyerUserData]);

  const memorizeSellerUserData: userDataType = useMemo(() => {
    return chat.sellerUserData;
  }, [chat.sellerUserData]);

  // 受信者が申請者の商品を選択したデータ
  const memorizeSelectsellerToBuyerItem: chatItemDataType = useMemo(() => {
    return chat.selectsellerToBuyerItem;
  }, [chat.selectsellerToBuyerItem]);

  // 🔥 最適化: 全データを並列取得して一度にstateを更新
  const getChatPageData = useCallback(
    async (tradeIdNumber: string) => {
      if (!tradeIdNumber) return;

      changeLoading(true);
      try {
        // 並列実行で全てのAPIを呼び出し
        const [
          messagesResponse,
          itemDetailResponse,
          partnerItemsResponse,
          shippingInfoResponse,
          confirmationsResponse,
        ] = await Promise.allSettled([
          getMessagesApi(tradeIdNumber),
          getChatItemDetailApi(tradeIdNumber),
          fetchPartnerItemsApi(tradeIdNumber),
          fetchShippingInfoApi(tradeIdNumber),
          fetchConfirmationsApi(tradeIdNumber),
        ]);

        // レスポンスの処理
        let messages: messagesType[] = [];
        let itemData: chatItemDataType | null = null;
        let partnerItems: chatItemDataType[] = [];
        let shippingInfo: shippingInfoType[] = [];
        let confirmations: confirmationType[] = [];
        let sellerUserData: userDataType | null = null;
        let buyerUserData: userDataType | null = null;

        // メッセージの処理
        if (messagesResponse.status === "fulfilled" && messagesResponse.value) {
          messages = messagesResponse.value.messages.map(
            (
              msg: {
                sender_id: string;
                message: string;
                sent_at: Date;
                sender_image_url: string;
              },
              index: number
            ) => ({
              avatar: msg.sender_image_url ?? "",
              position:
                String(msg.sender_id) === String(profile.profile.id)
                  ? ("right" as const)
                  : ("left" as const),
              text: msg.message,
              date: viewDate(msg.sent_at),
              id: index,
              userId: msg.sender_id,
            })
          );
        }

        // 交換申請したユーザーのアイテム詳細とユーザー情報の処理
        if (
          itemDetailResponse.status === "fulfilled" &&
          itemDetailResponse.value?.item &&
          itemDetailResponse.value?.user
        ) {
          const buyerUser = itemDetailResponse.value.user;
          buyerUserData = {
            age: buyerUser.age,
            location: buyerUser.location,
            name: buyerUser.name,
            old: buyerUser.old,
            profile_image: buyerUser.profile_image,
            reasen: buyerUser.reasen,
            shop_name: buyerUser.shop_name,
            shop_url: buyerUser.shop_url,
            tags: buyerUser.tags,
            user_id: buyerUser.user_id,
          };
          const item = itemDetailResponse.value.item;
          itemData = {
            trade_id: item.trade_id,
            item_id: item.item_id,
            title: item.title,
            description: item.description,
            type: item.type,
            brand: {
              key: item.brand.key,
              name: item.brand.name,
            },
            images: item.images,
            user_id: item.user_id,
            profile_image: item.profile_image,
            user_name: item.user_name,
            status: item.status,
            trade_status_flag: item.trade_status_flag,
          };
        }

        // パートナーアイテムの処理
        if (
          partnerItemsResponse.status === "fulfilled" &&
          partnerItemsResponse.value
        ) {
          partnerItems = partnerItemsResponse.value.partner_items;
          sellerUserData = partnerItemsResponse.value.partner_user;
        }

        // 発送情報の処理
        if (
          shippingInfoResponse.status === "fulfilled" &&
          shippingInfoResponse.value
        ) {
          shippingInfo = shippingInfoResponse.value.shipping_info || [];
        }

        // 確認情報の処理
        if (
          confirmationsResponse.status === "fulfilled" &&
          confirmationsResponse.value
        ) {
          confirmations = confirmationsResponse.value.confirmations || [];
        }

        // 一度にすべてのデータを更新
        dispatch(
          updateChatPageData({
            messages,
            itemData,
            partnerItems,
            shippingInfo,
            confirmations,
            sellerUserData,
            buyerUserData,
          })
        );

        changeLoading(false);
      } catch (error) {
        console.error("Chat page data fetch error:", error);
        errorSweetalert2("データの取得に失敗しました");
      } finally {
        changeLoading(false);
      }
    },
    [dispatch, changeLoading, profile.profile.id]
  );

  // チャットでの画像送信(未使用)
  const uploadImage = useCallback(async (formData: File) => {
    const response = await uploadImageApi(formData);
    if (response !== undefined) {
      return response.imageUrl;
    }
    return;
  }, []);

  // デバイスごとに高さ調整
  const upDateChatHight = useCallback(
    (hight: number | undefined): void => {
      if (hight === undefined) return;
      dispatch(updateChatHight(`${hight}px`));
    },
    [dispatch]
  );

  // ステータス変更
  const tradeStatusChangeHandler = useCallback(
    async (trade_id: string, status: string) => {
      const result = await trageStatusChange(trade_id, status);
      if (result !== undefined) {
        dispatch(updateItemData({ ...memorizeChatItemData, status }));
      }
    },
    [dispatch, memorizeChatItemData]
  );

  // 発送情報保存
  const saveShippingInfo = useCallback(
    async (
      tradeId: string,
      senderUserId: string,
      trackingNumber: string,
      shippingCompany: string
    ) => {
      const response = await saveShippingInfoApi(
        tradeId,
        senderUserId,
        trackingNumber,
        shippingCompany
      );
      if (response !== undefined) {
        // 発送情報のみを再取得
        const shippingResponse = await fetchShippingInfoApi(tradeId);
        if (shippingResponse?.shipping_info) {
          dispatch(updateShippingInfo(shippingResponse.shipping_info));
        }
      }
    },
    [dispatch]
  );

  // 受取確認
  const confirmItemReceived = useCallback(
    async (tradeId: string, userId: string) => {
      const response = await confirmItemReceivedApi(tradeId, userId);
      if (response !== undefined) {
        // 確認情報のみを再取得
        const confirmResponse = await fetchConfirmationsApi(tradeId);
        if (confirmResponse?.confirmations) {
          dispatch(updateConfirmations(confirmResponse.confirmations));
        }
      }
    },
    [dispatch]
  );

  const updateSelectsellerToBuyerItemHandler = useCallback(
    (item: chatItemDataType) => {
      dispatch(updateSelectsellerToBuyerItem(item));
    },
    [dispatch]
  );

  return {
    memorizeChatItemData,
    memorizeChatMessages,
    memorizeChatHight,
    memorizePartnerItems,
    memorizeShippingInfo,
    memorizeConfirmations,
    memorizeBuyerUserData,
    memorizeSellerUserData,
    memorizeSelectsellerToBuyerItem,
    getChatPageData,
    uploadImage,
    upDateChatHight,
    tradeStatusChangeHandler,
    saveShippingInfo,
    confirmItemReceived,
    updateSelectsellerToBuyerItemHandler,
  };
};

export default useChat;
