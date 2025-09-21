import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setItemsTagList,
  setItemsList,
  setSelectedTag,
  setOriginalItemsList,
  setItemsSearchTypeSelect,
  setItemsSearchBrandsSelect,
  resetItemsList,
  setCurrentPage,
  setHasMore,
  setIsLoading,
  appendItemsList,
} from "../store/itemsSlice";
import { RootState } from "../store";
import { itemListType } from "../types/itemType";
import { tagType } from "../types/listType";
import { getUserItemsApi } from "../api/itemApi";

type userItemsReturn = {
  memorizeOriginalItemsList: itemListType[];
  memorizeItemList: itemListType[];
  memorizeTagList: tagType[];
  memorizeSelectedTag: tagType[];
  memorizeItemsSearchTypeSelect: string;
  memorizeItemsSearchBrandsSelect: {
    key: string;
    name: string;
  };
  loadMoreItems: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  getItemListHandler: () => void;
  tagsUpdateHandler: (index: number, type: string) => void;
  selectedTagUpdateHandler: (
    list: Array<{
      key: number;
      name: string;
    }>
  ) => void;
  memorizeSliceSearchHandler: (value: string) => void;
  typeChangeHandler: (key: string) => void;
  brandChangeHandler: (brand: { key: string; name: string }) => void;
  itemFilterHandler: (keyword: string) => void;
  itemsFilterClearHandler: () => void;
};

const useItems = (): userItemsReturn => {
  const dispatch = useDispatch();
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

  const itemsSearchTypeSelect = useSelector(
    (state: RootState) => state.items.itemsSearchTypeSelect
  );

  const itemsSearchBrandsSelect = useSelector(
    (state: RootState) => state.items.itemsSearchBrandsSelect
  );

  const memorizeItemsSearchTypeSelect = useMemo(() => {
    return itemsSearchTypeSelect;
  }, [itemsSearchTypeSelect]);

  const memorizeItemsSearchBrandsSelect = useMemo(() => {
    return itemsSearchBrandsSelect;
  }, [itemsSearchBrandsSelect]);

  const memorizeSelectedTag = useMemo(() => {
    return selectedTag;
  }, [selectedTag]);

  const currentPage = useSelector(
    (state: RootState) => state.items.currentPage
  );
  const hasMore = useSelector((state: RootState) => state.items.hasMore);
  const isLoading = useSelector((state: RootState) => state.items.isLoading);

  // 自分以外の商品一覧取得
  const getItemListHandler = useCallback(async () => {
    dispatch(setIsLoading(true));
    dispatch(resetItemsList()); // リセット

    const response = await getUserItemsApi(profile.profile.id, 1, 20);

    if (response.success) {
      const itemList = processItemsResponse(response.data.items);
      const itemBrandList = response.data.brands.map((brand) => ({
        key: Number(brand.key),
        name: brand.name,
      }));

      dispatch(setItemsList(itemList));
      dispatch(setOriginalItemsList(itemList));
      dispatch(setItemsTagList(itemBrandList));
      dispatch(setCurrentPage(1));
      dispatch(setHasMore(response.data.has_more));
    }
    // エラーハンドリングは自動（createErrorResponseでトースト表示済み）

    dispatch(setIsLoading(false));
  }, [dispatch, profile.profile.id]);

  // 追加読み込み
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    dispatch(setIsLoading(true));
    const nextPage = currentPage + 1;

    const response = await getUserItemsApi(profile.profile.id, nextPage, 20);

    if (response.success) {
      const newItems = processItemsResponse(response.data.items);
      dispatch(appendItemsList(newItems));
      dispatch(setCurrentPage(nextPage));
      dispatch(setHasMore(response.data.has_more));
    }
    // エラーハンドリングは自動（createErrorResponseでトースト表示済み）

    dispatch(setIsLoading(false));
  }, [dispatch, profile.profile.id, currentPage, hasMore, isLoading]);

  // 商品データの処理（共通化）
  const processItemsResponse = (
    items: {
      seller_name: string;
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
    }[]
  ): itemListType[] => {
    return items.map((item) => ({
      user_name: item.seller_name,
      itemId: item.item_id,
      user_id: item.user_id,
      title: item.title,
      description: item.description,
      type: item.type,
      brand: item.brand[0] || { key: "", name: "" },
      images: item.images,
      uploaded_at: item.uploaded_at,
      profile_image: item.profile_image,
      tradeStatusFlag: item.trade_status_flag,
    }));
  };

  // タグ検索(使用しない)
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

  const itemFilterHandler = useCallback(
    (keyword: string) => {
      // オリジナルのリストから絞り込みを開始
      let filteredItems = [...originalItemsList];

      // タイプによる絞り込み
      if (itemsSearchTypeSelect) {
        filteredItems = filteredItems.filter(
          (item) => item.type === itemsSearchTypeSelect
        );
      }

      // ブランドによる絞り込み
      if (itemsSearchBrandsSelect.key) {
        filteredItems = filteredItems.filter(
          (item) => item.brand?.key === itemsSearchBrandsSelect.key
        );
      }

      // キーワードによる絞り込み
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filteredItems = filteredItems.filter(
          (item) =>
            item.title?.toLowerCase().includes(lowerKeyword) ||
            item.description?.toLowerCase().includes(lowerKeyword) ||
            item.brand?.name?.toLowerCase().includes(lowerKeyword)
        );
      }

      // 絞り込み結果をストアに反映
      dispatch(setItemsList(filteredItems));
      return;
    },
    [
      originalItemsList,
      itemsSearchTypeSelect,
      itemsSearchBrandsSelect,
      dispatch,
    ]
  );

  const typeChangeHandler = useCallback(
    (key: string) => {
      // オリジナルのリストから絞り込みを開始
      let filteredItems = [...originalItemsList];
      filteredItems = filteredItems.filter((item) => item.type === key);
      // 絞り込み結果をストアに反映
      dispatch(setItemsList(filteredItems));
      dispatch(setItemsSearchTypeSelect(key));
      return;
    },
    [dispatch, originalItemsList]
  );

  const brandChangeHandler = useCallback(
    (brand: { key: string; name: string }) => {
      let filteredItems = [...originalItemsList];
      filteredItems = filteredItems.filter((item) => {
        if (item.brand.key !== "") {
          return item.brand?.key === itemsSearchBrandsSelect.key;
        }
        return;
      });
      dispatch(setItemsSearchBrandsSelect(brand));
      dispatch(setItemsList(filteredItems));
      return;
    },
    [dispatch, itemsSearchBrandsSelect.key, originalItemsList]
  );

  const itemsFilterClearHandler = useCallback(() => {
    dispatch(
      setItemsSearchBrandsSelect({
        key: "",
        name: "",
      })
    );
    dispatch(setItemsSearchTypeSelect(""));
    dispatch(setItemsList(originalItemsList));
  }, [dispatch, originalItemsList]);

  return {
    selectedTagUpdateHandler,
    getItemListHandler,
    tagsUpdateHandler,
    memorizeSliceSearchHandler,
    typeChangeHandler,
    brandChangeHandler,
    itemFilterHandler,
    itemsFilterClearHandler,
    memorizeOriginalItemsList,
    memorizeItemList,
    memorizeTagList,
    memorizeSelectedTag,
    memorizeItemsSearchTypeSelect,
    memorizeItemsSearchBrandsSelect,
    loadMoreItems,
    hasMore,
    isLoading,
  };
};

export default useItems;
