import { FC, useCallback } from "react";
import { VStack } from "@chakra-ui/react";
import SearchForm from "../form/searchForm";
import RebderItem from "../common/render/renderItem";
import useItems from "../../hooks/useItems";
import { useLocation, useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useLoading from "../../hooks/useLaoding";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import { useDispatch } from "react-redux";
import { setTargetDetailUser } from "../../store/usersSlice";
import ComponentItemsHeader from "../common/layout/componentItemsHeader";
import { menuLists } from "../../consts/menuList";

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
          itemId: index,
        })
      );
      navigate(`${route.itemDetail}`);
    },
    [dispath, navigate]
  );

  return (
    <>
      <ComponentItemsHeader
        title={menuLists[1].text}
        itemCount={memorizeItemList.length}
      />
      {memorizeLoading && <FullScreenSpinner />}
      <VStack align={"start"}>
        <SearchForm
          tagList={memorizeTagList}
          hidden={false}
          route={pathname}
          selectedTag={memorizeSelectedTag}
        />
        <RebderItem itemList={memorizeItemList} navigate={itemDetailHanlder} />
      </VStack>
    </>
  );
};

export default Home;
