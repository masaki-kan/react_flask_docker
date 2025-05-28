import { useCallback, useMemo } from "react";
import {
  getChatItemDetailApi,
  uploadImageApi,
  getMessagesApi,
} from "../api/chatApi";
import { chatItemDataType, messagesType } from "../types/chatType";
import { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import {
  updateMessages,
  updateItemData,
  updateChatHight,
} from "../store/chatSlice";
import { viewDate } from "../component/common/date/format";
import useLoading from "./useLaoding";

type useChatReturn = {
  memorizeChatMessages: messagesType[];
  memorizeChatItemData: chatItemDataType;
  memorizeChatHight: string;
  getItemDetail: (item_id: string) => Promise<void>;
  uploadImage: (FormData: File) => Promise<string | undefined>;
  fetchMessages: (
    tradeIdNumver: string,
    userIdNumver: string | null
  ) => Promise<void>;
  upDateChatHight: (hight: number | undefined) => void;
};

const useChat = (): useChatReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const chat = useSelector((state: RootState) => state.chat);

  const memorizeChatMessages: messagesType[] = useMemo(() => {
    return chat.messages;
  }, [chat]);

  const memorizeChatItemData: chatItemDataType = useMemo(() => {
    return chat.itemData;
  }, [chat]);

  const memorizeChatHight: string = useMemo(() => {
    return chat.chatHight;
  }, [chat]);

  const fetchMessages = useCallback(
    async (tradeIdNumver: string, userIdNumver: string | null) => {
      if (userIdNumver === null) return;
      changeLoading(true);
      const response = await getMessagesApi(tradeIdNumver);

      if (response !== undefined) {
        const fetchedMessages = response.messages.map(
          (
            msg: {
              sender_id: string;
              message: string;
              sent_at: Date;
              sender_image_url: string;
            },
            index: number
          ) => ({
            avatar: msg.sender_image_url ?? "https://bit.ly/broken-link", // or msg.avatar if available
            position:
              String(msg.sender_id) === String(userIdNumver) ? "right" : "left",
            text: msg.message,
            date: viewDate(msg.sent_at),
            id: index,
            userId: msg.sender_id,
          })
        );
        dispatch(updateMessages(fetchedMessages));
      }
      changeLoading(false);
    },
    [changeLoading, dispatch]
  );
  const getItemDetail = useCallback(
    async (item_id: string) => {
      const response = await getChatItemDetailApi(item_id);

      if (response !== undefined) {
        const itemData = {
          item_id: response.item.item_id,
          title: response.item.title,
          description: response.item.description,
          price: response.item.price,
          curr: response.item.curr,
          type: response.item.type,
          brand: {
            key: response.item.brand.key,
            name: response.item.brand.name,
          },
          images: response.item.images,
          user_id: response.item.user_id,
          profile_image: response.item.profile_image,
          seller_name: response.item.seller_name,
        };
        dispatch(updateItemData(itemData));
      }
    },
    [dispatch]
  );

  const uploadImage = useCallback(async (formData: File) => {
    const response = await uploadImageApi(formData);
    if (response !== undefined) {
      return response.imageUrl;
    }

    return;
  }, []);

  const upDateChatHight = useCallback(
    (hight: number | undefined): void => {
      if (hight === undefined) return;
      console.log(hight);
      dispatch(updateChatHight(`${hight}px`));
    },
    [dispatch]
  );

  return {
    memorizeChatItemData,
    memorizeChatMessages,
    memorizeChatHight,
    getItemDetail,
    uploadImage,
    fetchMessages,
    upDateChatHight,
  };
};

export default useChat;
