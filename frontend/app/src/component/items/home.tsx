import { Heading, VStack } from "@chakra-ui/react";
import { FC, useCallback, useEffect } from "react";
import SearchForm from "../common/form/searchForm";
import RebderItem from "../common/render/renderItem";
import useItems from "../../hooks/useItems";
import { useLocation, useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useProfile from "../../hooks/useProfile";
import useAlert from "../../hooks/useAlert";

const Home: FC = () => {
  const { defaultAlert } = useAlert();
  const navigate = useNavigate();

  const { getUserProfile } = useProfile();
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
  }, [getItemListHandler, getItemsTagListHandler]);

  const itemDetailHanlder = useCallback(
    (index: number) => {
      if (getUserProfile().items[index] === undefined) {
        defaultAlert(true);

        return;
      }
      navigate(`${route.itemDetail}?number=${index}`);
    },
    [defaultAlert, getUserProfile, navigate]
  );

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
          navigate={itemDetailHanlder}
        />
      </VStack>
    </>
  );
};

export default Home;
