import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setItemsTagList,
  setItemsList,
  setSelectedTag,
  setOriginalItemsList,
} from "../store/itemsSlice";
import { RootState } from "../store";
import { itemListType } from "../types/itemType";
import { tagType } from "../types/listType";
import { getUserItemsApi } from "../api/itemApi";
import useLoading from "./useLaoding";

type userItemsReturn = {
  memorizeOriginalItemsList: itemListType[];
  memorizeItemList: itemListType[];
  memorizeTagList: tagType[];
  memorizeSelectedTag: tagType[];
  getItemListHandler: () => void;
  tagsUpdateHandler: (index: number, type: string) => void;
  selectedTagUpdateHandler: (
    list: Array<{
      key: number;
      name: string;
    }>
  ) => void;
  memorizeSliceSearchHandler: (value: string) => void;
};

const useItems = (): userItemsReturn => {
  const dispatch = useDispatch();
  const { changeLoading } = useLoading();
  const profile = useSelector((state: RootState) => state.profile);

  const originalItemsList = useSelector(
    (state: RootState) => state.items.originalItemsList
  );
  const memorizeOriginalItemsList = useMemo(() => {
    return originalItemsList;
  }, [originalItemsList]);

  // 自分以外の商品一覧
  const itemsList = useSelector((state: RootState) => state.items.itemsList);
  const memorizeItemList = useMemo(() => {
    return itemsList;
  }, [itemsList]);

  const itemtTagList = useSelector(
    (state: RootState) => state.items.itemsTagList
  );
  const memorizeTagList = useMemo(() => {
    return itemtTagList;
  }, [itemtTagList]);

  const selectedTag = useSelector(
    (state: RootState) => state.items.selectedTag
  );
  const memorizeSelectedTag = useMemo(() => {
    return selectedTag;
  }, [selectedTag]);

  const getItemListHandler = useCallback(async () => {
    changeLoading(true);
    const response = await getUserItemsApi(profile.profile.id);
    if (response !== undefined) {
      const rawItems = Array.isArray(response.items)
        ? response.items
        : [response.items];

      const itemList: itemListType[] = rawItems.map(
        (item: {
          item_id: string;
          title: string;
          description: string;
          type: string;
          brand: { key: string; name: string }[];
          images: string[];
          uploaded_at: Date;
          profile_image: string;
          user_id: number;
          trade_status_flag: number;
        }) => {
          return {
            itemId: item.item_id,
            user_id: item.user_id,
            title: item.title,
            description: item.description,
            type: item.type,
            brand: item.brand[0],
            images: item.images,
            uploaded_at: item.uploaded_at,
            profile_image: item.profile_image,
            tradeStatusFlag: item.trade_status_flag,
          };
        }
      );

      const itemBrandList: tagType[] = response.brands.map((brand) => {
        return {
          key: Number(brand.key),
          name: brand.name,
        };
      });

      dispatch(setOriginalItemsList(itemList));
      dispatch(setItemsList(itemList));
      dispatch(setItemsTagList(itemBrandList));
    }
    changeLoading(false);
  }, [changeLoading, dispatch, profile.profile.id]);

  const tagsUpdateHandler = useCallback(
    (index: number, type: string) => {
      if (type !== "add") {
        const newTagArray = [...itemtTagList];
        const fillteredTags = newTagArray.filter((_, idx) => idx !== index);
        dispatch(setItemsTagList(fillteredTags));
      } else {
        const tag = selectedTag[index];
        const newArray = [...itemtTagList];
        newArray.push(tag);
        newArray.sort((a, b) => a.key - b.key);
        dispatch(setItemsTagList(newArray));
      }
    },
    [dispatch, itemtTagList, selectedTag]
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
      let filtered = [...originalItemsList];

      // タグフィルター
      if (tags !== undefined && tags.length > 0) {
        const selectedKeys = tags.map((tag) => String(tag.key));
        filtered = filtered.filter((item) => {
          if (Array.isArray(item.brand)) {
            return item.brand.some((brand) =>
              selectedKeys.includes(String(brand.key))
            );
          } else {
            return selectedKeys.includes(String(item.brand?.key));
          }
        });
      }

      // キーワードフィルター
      if (value !== undefined && value.trim() !== "") {
        filtered = filtered.filter((item) =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
      }

      // タグもキーワードもない場合
      if (tags?.length === 0 && (value?.trim() === "" || value === undefined)) {
        filtered = originalItemsList;
      }

      dispatch(setItemsList(filtered));
    },
    [dispatch, originalItemsList]
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
    selectedTagUpdateHandler,
    getItemListHandler,
    tagsUpdateHandler,
    memorizeSliceSearchHandler,
    memorizeOriginalItemsList,
    memorizeItemList,
    memorizeTagList,
    memorizeSelectedTag,
  };
};

export default useItems;
