import { Heading, VStack } from "@chakra-ui/react";
import { FC, useEffect } from "react";
import SearchForm from "../common/form/searchForm";
import RebderItem from "../common/render/renderItem";
import useItems from "../../hooks/useItems";
import { useLocation } from "react-router-dom";

const Home: FC = () => {
  const pathname = useLocation().pathname;

  const {
    getItemsTagListHandler,
    getItemListHandler,
    memorizeItemList,
    memorizeTagList,
    memorizeSelectedTag,
  } = useItems();

  useEffect(() => {
    getItemsTagListHandler();
    getItemListHandler();
  }, []);

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "center", md: "justify" }}
      >
        Items
      </Heading>

      <VStack align={"start"} mt={10}>
        <SearchForm
          tagList={memorizeTagList}
          hidden={false}
          route={pathname}
          selectedTag={memorizeSelectedTag}
        />
        <RebderItem
          itemList={memorizeItemList}
          avatar={false}
          navigate={() => {}}
        />
      </VStack>
    </>
  );
};

export default Home;
