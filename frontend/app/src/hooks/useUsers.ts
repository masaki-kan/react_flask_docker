import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUserList,
  setTagList,
  setSelectedTag,
  setOriginalData,
} from "../store/usersSlice";
import { RootState } from "../store";
import { getUsersApi } from "../api/userApis";
import { followListType, tagType } from "../types/listType";
import useLoading from "./useLaoding";

type useListingReturn = {
  memorizeUserList: followListType[];
  memorizeOriginalUserData: followListType[];
  memorizeTagList: tagType[];
  memorizeFollowLists: followListType[];
  memorizeFollowersLists: followListType[];
  memorizeSelectedTag: tagType[];
  getUserListHandler: () => void;
  tagsUpdateHandler: (index: number, type: string) => void;
  selectedTagUpdateHandler: (list: tagType[]) => void;
  memorizeSliceSearchHandler: (value: string) => void;
};

const useUsers = (): useListingReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const profile = useSelector((state: RootState) => state.profile);

  // 自分以外のユーザー
  const originalUserData = useSelector(
    (state: RootState) => state.users.originalData
  );
  const memorizeOriginalUserData = useMemo(() => {
    return originalUserData;
  }, [originalUserData]);

  // 自分以外のユーザー
  const userList = useSelector((state: RootState) => state.users.userList);
  const memorizeUserList = useMemo(() => {
    return userList;
  }, [userList]);

  // タグリスト
  const tagList = useSelector((state: RootState) => state.users.tagList);
  const memorizeTagList = useMemo(() => {
    return tagList;
  }, [tagList]);

  // フォローリスト
  const memorizeFollowLists = useMemo(() => {
    return originalUserData.filter((data) => data.is_following === 1);
  }, [originalUserData]);

  // フォワーリスト
  const memorizeFollowersLists = useMemo(() => {
    return originalUserData.filter((data) => data.is_followed === 1);
  }, [originalUserData]);

  // 選択タグ
  const selectedTag = useSelector(
    (state: RootState) => state.users.selectedTag
  );
  const memorizeSelectedTag = useMemo(() => {
    return selectedTag;
  }, [selectedTag]);

  //自分以外ユーザー一覧取得
  const getUserListHandler = useCallback(async () => {
    changeLoading(true);
    const response = await getUsersApi(profile.profile.id);

    if (response !== undefined) {
      const newUserList: followListType[] = response.users.map((user) => ({
        user_id: user.user_id,
        name: user.name,
        location: user.location,
        age: user.age,
        image_url: user.image_url,
        uploaded_at: user.uploaded_at,
        item_count: user.item_count,
        is_followed: user.is_followed,
        is_following: user.is_following,
        tags: user.tags.map((tag: tagType) => ({
          key: tag.key,
          name: tag.name,
        })),
      }));

      // 保存
      dispatch(setUserList(newUserList));
      dispatch(setOriginalData(newUserList)); // 更新はこの後
    }

    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  //タグ選択後関数
  const tagsUpdateHandler = useCallback(
    (index: number, type: string) => {
      if (type !== "add") {
        const newTagArray = [...tagList];
        const fillteredTags = newTagArray.filter((_, idx) => idx !== index);
        dispatch(setTagList(fillteredTags));
      } else {
        const tag = selectedTag[index];
        const newArray = [...tagList];
        newArray.push(tag);
        newArray.sort((a, b) => a.key - b.key);
        dispatch(setTagList(newArray));
      }
    },
    [dispatch, selectedTag, tagList]
  );

  // 絞り込み共通ロジック
  const filterUsers = useCallback(
    (
      value: string | undefined,
      tags:
        | {
            key: number;
            name: string;
          }[]
        | undefined
    ) => {
      let filtered = [...originalUserData];

      // タグフィルター
      if (tags !== undefined && tags.length > 0) {
        const selectedKeys = tags.map((tag) => String(tag.key));
        filtered = filtered.filter((user) =>
          user.tags.some((tag) => selectedKeys.includes(String(tag.key)))
        );
      }

      // キーワードフィルター
      if (value !== undefined && value.trim() !== "") {
        filtered = filtered.filter((user) =>
          user.name.toLowerCase().includes(value.toLowerCase())
        );
      }

      // タグもキーワードもない場合
      if (tags?.length === 0 && (value?.trim() === "" || value === undefined)) {
        filtered = originalUserData;
      }

      dispatch(setUserList(filtered));
    },
    [dispatch, originalUserData]
  );

  // タグ選択時
  const selectedTagUpdateHandler = useCallback(
    (list: Array<{ key: number; name: string }>) => {
      dispatch(setSelectedTag(list));
      filterUsers(undefined, list); // 絞り込み再実行
    },
    [dispatch, filterUsers]
  );

  // キーワード検索時
  const memorizeSliceSearchHandler = useCallback(
    (value: string) => {
      filterUsers(value, undefined); // 絞り込み再実行
    },
    [filterUsers]
  );

  return {
    memorizeOriginalUserData,
    memorizeUserList,
    memorizeTagList,
    memorizeFollowLists,
    memorizeFollowersLists,
    getUserListHandler,
    tagsUpdateHandler,
    memorizeSelectedTag,
    selectedTagUpdateHandler,
    memorizeSliceSearchHandler,
  };
};

export default useUsers;
