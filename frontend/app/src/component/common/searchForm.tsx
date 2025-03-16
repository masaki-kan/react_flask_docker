import React, { FC, useCallback, useEffect } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
} from "@chakra-ui/react";
import useUsers from "../../hooks/useUsers";
import useItems from "../../hooks/useItems";
import { tagType } from "../../types/listTye";
import { route as routeName } from "../../route/routeConst";

type SearchFormProps = {
  hidden?: boolean;
  tagList: tagType[];
  selectedTag: tagType[];
  route: string;
};

const SearchForm: FC<SearchFormProps> = React.memo(
  ({ hidden, tagList, selectedTag, route }) => {
    const {
      getTagListHandler,
      getFollowList,
      getFollowersList,
      getUserListHandler,
      tagsUpdateHandler: userTagsUpdateHandler,
      selectedTagUpdateHandler: userSelectedTagUpdateHandler,
    } = useUsers();

    const {
      tagsUpdateHandler: itemTagUpdateHandler,
      selectedTagUpdateHandler: itemSelectedTagUpdateHandler,
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

          case routeName.Items:
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

          case routeName.Items:
            itemTagUpdateHandler(index, "add");
            itemSelectedTagUpdateHandler(fillteredTags);
            break;

          default:
            break;
        }
      },
      [
        itemSelectedTagUpdateHandler,
        itemTagUpdateHandler,
        route,
        selectedTag,
        userSelectedTagUpdateHandler,
        userTagsUpdateHandler,
      ]
    );

    useEffect(() => {
      getTagListHandler();
      getFollowList();
      getFollowersList();
      getUserListHandler();
    }, [
      getFollowList,
      getFollowersList,
      getTagListHandler,
      getUserListHandler,
    ]);

    return (
      <VStack hidden={hidden} align={"start"} w={"full"} gap={3}>
        <FormControl>
          <FormLabel>Search</FormLabel>
          <Input placeholder="First name" size="md" />
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
              <Tag key={index} mx={2}>
                <TagLabel> {tag.name}</TagLabel>
                <TagCloseButton onClick={() => removeTagHandler(index)} />
              </Tag>
            );
          })}
        </Box>

        <Flex gap="2">
          {tagList.map((tag, index) => (
            <Tag
              size="lg"
              key={index}
              variant="outline"
              colorScheme="teal"
              cursor="pointer"
              onClick={() => selectedTagAddHandler(index)}
            >
              <TagLabel>{tag.name}</TagLabel>
            </Tag>
          ))}
        </Flex>
      </VStack>
    );
  }
);

export default SearchForm;
