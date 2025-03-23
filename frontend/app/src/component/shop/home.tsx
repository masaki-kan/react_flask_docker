import { FC, useEffect } from "react";
import { Container, Heading, VStack } from "@chakra-ui/react";
import RenderItemTag from "../common/rebderItemTag";
import RebderItem from "../common/renderItem";
import useItems from "../../hooks/useItems";

const Home: FC = () => {
  const {
    getItemsTagListHandler,
    getItemListHandler,
    memorizeItemList,
    memorizeTagList,
  } = useItems();

  useEffect(() => {
    getItemsTagListHandler();
    getItemListHandler();
  }, []);

  return (
    <>
      <>
        <Container maxW="container.xl">
          <Heading
            pl={{ md: 4, base: 0 }}
            textAlign={{ base: "center", md: "justify" }}
          >
            Women's Vintage Clothing
          </Heading>
          <VStack align={"start"} mt={10}>
            <RenderItemTag tagList={memorizeTagList} />
            <RebderItem itemList={memorizeItemList} navigate={() => {}} />
          </VStack>
        </Container>
      </>
    </>
  );
};

export default Home;
