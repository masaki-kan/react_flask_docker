import { FC, useCallback } from "react";
import { Heading, VStack, Text } from "@chakra-ui/react";
import SearchForm from "../common/form/searchForm";
import RebderItem from "../common/render/renderItem";
import useItems from "../../hooks/useItems";
import { useLocation, useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useLoading from "../../hooks/useLaoding";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import { useDispatch } from "react-redux";
import { setTargetDetailUser } from "../../store/usersSlice";

const Home: FC = () => {
  const navigate = useNavigate();
  const dispath = useDispatch();
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
    (index: string) => {
      dispath(
        setTargetDetailUser({
          userName: memorizeItemList[0].user_name,
          userId: "",
          itemId: index,
        })
      );
      navigate(`${route.itemDetail}`);
    },
    [dispath, memorizeItemList, navigate]
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
        {memorizeItemList.length === 0 && (
          <Text px={4}>現在出品商品はありません。</Text>
        )}
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
