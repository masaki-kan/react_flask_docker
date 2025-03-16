import { Container, Heading, VStack } from "@chakra-ui/react";
import { FC, useEffect } from "react";
import SearchForm from "../common/searchForm";
import RebderItem from "../common/renderItem";
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
    <Container maxW="container.xl">
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
        <RebderItem itemList={memorizeItemList} />
      </VStack>
    </Container>
  );
};

export default Home;
