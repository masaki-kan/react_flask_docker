import React, { ChangeEvent, FC, useCallback, useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
} from "@chakra-ui/react";
import useUsers from "../../../hooks/useUsers";
import useItems from "../../../hooks/useItems";
import { tagType } from "../../../types/listType";
import { route as routeName } from "../../../route/routeConst";
import { useLocation } from "react-router-dom";

type SearchFormProps = {
  hidden?: boolean;
  tagList: tagType[];
  selectedTag: tagType[];
  route: string;
};

const SearchForm: FC<SearchFormProps> = React.memo(
  ({ hidden, tagList, selectedTag, route }) => {
    const pathname = useLocation().pathname;
    const [search, setSearch] = useState<string>("");
    const {
      tagsUpdateHandler: userTagsUpdateHandler,
      selectedTagUpdateHandler: userSelectedTagUpdateHandler,
      memorizeSliceSearchHandler: userSliceSearchHandler,
    } = useUsers();

    const {
      tagsUpdateHandler: itemTagUpdateHandler,
      selectedTagUpdateHandler: itemSelectedTagUpdateHandler,
      memorizeSliceSearchHandler: itemSliceSearchHandler,
    } = useItems();

    const selectedTagAddHandler = useCallback(
      (index: number) => {
        const newArray = [...selectedTag];
        newArray.push(tagList[index]);

        switch (route) {
          case routeName.users:
            userTagsUpdateHandler(index, "remove");
            userSelectedTagUpdateHandler(newArray);
            break;

          case routeName.items:
            itemTagUpdateHandler(index, "remove");
            itemSelectedTagUpdateHandler(newArray);
            break;

          default:
            break;
        }
      },
      [
        selectedTag,
        tagList,
        route,
        userTagsUpdateHandler,
        userSelectedTagUpdateHandler,
        itemTagUpdateHandler,
        itemSelectedTagUpdateHandler,
      ]
    );

    const removeTagHandler = useCallback(
      (index: number) => {
        const fillteredTags = selectedTag.filter((_, idx) => idx !== index);

        switch (route) {
          case routeName.users:
            userTagsUpdateHandler(index, "add");
            userSelectedTagUpdateHandler(fillteredTags);
            break;

          case routeName.items:
            itemTagUpdateHandler(index, "add");
            itemSelectedTagUpdateHandler(fillteredTags);
            break;

          default:
            break;
        }
      },
      [
        route,
        selectedTag,
        itemSelectedTagUpdateHandler,
        itemTagUpdateHandler,
        userSelectedTagUpdateHandler,
        userTagsUpdateHandler,
      ]
    );

    const searchHandler = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (pathname === "/items") {
          itemSliceSearchHandler(value);
        } else {
          userSliceSearchHandler(value);
        }
        setSearch(value);
      },
      [itemSliceSearchHandler, userSliceSearchHandler, pathname]
    );

    return (
      <VStack hidden={hidden} align={"start"} w={"full"} gap={3}>
        <FormControl>
          <FormLabel>検索</FormLabel>
          <Input
            bg={"white"}
            placeholder="ユーザー名検索"
            size="md"
            defaultValue={search}
            onChange={(e) => searchHandler(e)}
          />
        </FormControl>

        <Box
          px={2}
          py={2}
          borderWidth="1px"
          borderRadius="lg"
          width={"full"}
          hidden={selectedTag.length > 0 ? false : true}
        >
          {selectedTag.map((tag, index) => {
            return (
              <Tag key={index} mx={2} mb={2}>
                <TagLabel>{tag.name}</TagLabel>
                <TagCloseButton onClick={() => removeTagHandler(index)} />
              </Tag>
            );
          })}
        </Box>

        <Wrap gap="2">
          {tagList.map((tag, index) => (
            <Tag
              size="lg"
              key={index}
              cursor="pointer"
              onClick={() => selectedTagAddHandler(index)}
            >
              <TagLabel>{tag.name}</TagLabel>
            </Tag>
          ))}
        </Wrap>
      </VStack>
    );
  }
);

export default SearchForm;
