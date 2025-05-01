import { FC, useCallback } from "react";
import { Heading, VStack } from "@chakra-ui/react";
import SearchForm from "../common/form/searchForm";
import RebderItem from "../common/render/renderItem";
import useItems from "../../hooks/useItems";
import { useLocation, useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useProfile from "../../hooks/useProfile";
import useLoading from "../../hooks/useLaoding";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";

const Home: FC = () => {
  const navigate = useNavigate();
  const { getUserProfile } = useProfile();
  const pathname = useLocation().pathname;
  const { memorizeLoading } = useLoading();
  const {
    getItemListHandler,
    memorizeItemList,
    memorizeTagList,
    memorizeSelectedTag,
  } = useItems();

  useEffectOnce(() => {
    getItemListHandler();
  });

  const itemDetailHanlder = useCallback(
    (index: number) => {
      if (getUserProfile().items[index] === undefined) {
        navigate(`${route.itemDetail}?number=${index}`);

        return;
      }
      navigate(`${route.itemDetail}?number=${index}`);
    },
    [getUserProfile, navigate]
  );

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Items
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
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
