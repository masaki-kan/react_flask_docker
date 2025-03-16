import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUserList,
  setTagList,
  setFollowList,
  setFollowersList,
  setSelectedTag,
} from "../store/usersSlice";
import { RootState } from "../store";
import { followListType, tagType } from "../types/listTye";

type useListingReturn = {
  memorizeUserList: followListType[];
  getTagListHandler: () => void;
  memorizeTagList: tagType[];
  getFollowList: () => void;
  memorizeFollowLists: followListType[];
  getFollowersList: () => void;
  memorizeFollowersLists: followListType[];
  getUserListHandler: () => void;
  tagsUpdateHandler: (index: number, type: string) => void;
  memorizeSelectedTag: tagType[];
  selectedTagUpdateHandler: (
    list: Array<{
      id: number;
      name: string;
    }>
  ) => void;
};

const useListing = (): useListingReturn => {
  const dispatch = useDispatch();
  const userList = useSelector((state: RootState) => state.users.userList);
  const memorizeUserList = useMemo(() => {
    return userList;
  }, [userList]);

  const tagList = useSelector((state: RootState) => state.users.tagList);
  const memorizeTagList = useMemo(() => {
    return tagList;
  }, [tagList]);

  const followLists = useSelector(
    (state: RootState) => state.users.followLists
  );
  const memorizeFollowLists = useMemo(() => {
    return followLists;
  }, [followLists]);

  const followersLists = useSelector(
    (state: RootState) => state.users.followersList
  );
  const memorizeFollowersLists = useMemo(() => {
    return followersLists;
  }, [followersLists]);

  const selectedTag = useSelector(
    (state: RootState) => state.users.selectedTag
  );
  const memorizeSelectedTag = useMemo(() => {
    return selectedTag;
  }, [selectedTag]);

  const getTagListHandler = useCallback(() => {
    const tags = [
      {
        id: 1,
        name: "Tag1",
      },
      {
        id: 2,
        name: "Tag2",
      },
      {
        id: 3,
        name: "Tag3",
      },
      {
        id: 4,
        name: "Tag4",
      },
      {
        id: 5,
        name: "Tag5",
      },
    ];

    dispatch(setTagList(tags));
  }, [dispatch]);

  const getFollowList = useCallback(() => {
    const folletListData = [
      {
        id: 1,
        name: "名前 1",
        itemNumber: 10,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
      {
        id: 2,
        name: "名前 2",
        itemNumber: 20,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
    ];

    dispatch(setFollowList(folletListData));
  }, [dispatch]);

  const getFollowersList = useCallback(() => {
    const folleertListData = [
      {
        id: 3,
        name: "名前 3",
        itemNumber: 30,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
    ];

    dispatch(setFollowersList(folleertListData));
  }, [dispatch]);

  const getUserListHandler = useCallback(() => {
    const userListData = [
      {
        id: 1,
        name: "名前 1",
        itemNumber: 10,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
      {
        id: 2,
        name: "名前 2",
        itemNumber: 20,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
      {
        id: 3,
        name: "名前 3",
        itemNumber: 10,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
      {
        id: 4,
        name: "名前 4",
        itemNumber: 20,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
    ];
    dispatch(setUserList(userListData));
  }, [dispatch]);

  const selectedTagUpdateHandler = useCallback(
    (list: Array<{ id: number; name: string }>) => {
      dispatch(setSelectedTag(list));
    },
    [dispatch]
  );

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
        newArray.sort((a, b) => a.id - b.id);
        dispatch(setTagList(newArray));
      }
    },
    [dispatch, selectedTag, tagList]
  );

  return {
    memorizeUserList,
    getTagListHandler,
    memorizeTagList,
    getFollowList,
    memorizeFollowLists,
    getFollowersList,
    memorizeFollowersLists,
    getUserListHandler,
    tagsUpdateHandler,
    memorizeSelectedTag,
    selectedTagUpdateHandler,
  };
};

export default useListing;
