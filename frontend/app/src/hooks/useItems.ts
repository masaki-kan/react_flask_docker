import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setItemsTagList,
  setItemsList,
  setSelectedTag,
} from "../store/itemsSlice";
import { RootState } from "../store";
import { itemListType } from "../types/item";
import { tagType } from "../types/listTye";

type userItemsReturn = {
  memorizeItemList: itemListType[];
  memorizeTagList: tagType[];
  memorizeSelectedTag: tagType[];
  getItemsTagListHandler: () => void;
  getItemListHandler: () => void;
  tagsUpdateHandler: (index: number, type: string) => void;
  selectedTagUpdateHandler: (
    list: Array<{
      id: number;
      name: string;
    }>
  ) => void;
};

const useItems = (): userItemsReturn => {
  const dispatch = useDispatch();

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

  const getItemsTagListHandler = useCallback(() => {
    const tags = [
      {
        id: 1,
        name: "All Women's Clothing",
      },
      {
        id: 2,
        name: "Dresses",
      },
      {
        id: 3,
        name: "Jackets &amp; Coats",
      },
      {
        id: 4,
        name: "Swim",
      },
      {
        id: 5,
        name: "Pants",
      },
      {
        id: 5,
        name: "Skirts",
      },
      {
        id: 5,
        name: "Shorts",
      },
    ];

    dispatch(setItemsTagList(tags));
  }, [dispatch]);

  const getItemListHandler = () => {
    const itemListData = [
      {
        title: "Vintage 70s Navy Blue Wool Coa ",
        description: "",
        price: 8500,
        currency: "¥",
        type: { key: "0", name: "パンツ" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/b7dd176c-c822-4e72-998e-9b1575310749.png",
        ],
      },
      {
        title: "Vintage 90s Black &amp; White Striped Tee",
        description: "",
        price: 5000,
        currency: "¥",
        type: { key: "0", name: "パンツ" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/4f6e9eb1-9d0e-4435-9600-d63646766c03.png",
        ],
      },
      {
        title: "Vintage 80s Red &amp; White Polka Dot Skirt",
        price: 6000,
        description: "",
        currency: "¥",
        type: { key: "0", name: "パンツ" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/5b42b424-7e9e-4709-9c27-36575d515b37.png",
        ],
      },
      {
        title: "Vintage 90s Grunge Plaid Flannel Shirt",
        price: 9000,
        description: "",
        currency: "¥",
        type: { key: "0", name: "パンツ" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/783d7af6-179e-4116-a3b6-0fdd9ad99bcc.png",
        ],
      },
      {
        title: "Vintage 60s Boho Embroidered Blouse",
        price: 10000,
        description: "",
        currency: "¥",
        type: { key: "0", name: "パンツ" },
        brand: { key: "0", name: "90's" },
        image: [
          "https://cdn.usegalileo.ai/sdxl10/764d360f-7916-4467-8d3f-efd16e94bcd2.png",
        ],
      },
    ];

    dispatch(setItemsList(itemListData));
  };

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
        newArray.sort((a, b) => a.id - b.id);
        dispatch(setItemsTagList(newArray));
      }
    },
    [dispatch, itemtTagList, selectedTag]
  );

  const selectedTagUpdateHandler = useCallback(
    (list: Array<{ id: number; name: string }>) => {
      dispatch(setSelectedTag(list));
    },
    [dispatch]
  );

  return {
    getItemsTagListHandler,
    selectedTagUpdateHandler,
    getItemListHandler,
    tagsUpdateHandler,
    memorizeItemList,
    memorizeTagList,
    memorizeSelectedTag,
  };
};

export default useItems;
