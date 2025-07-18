import { FC, useCallback } from "react";
import { VStack, Box } from "@chakra-ui/react";
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
import ComponentHeader from "../common/layout/componentHeader";
import { menuLists } from "../../consts/menuList";
import { AnimatePresence, motion } from "framer-motion";

const Home: FC = () => {
  const navigate = useNavigate();
  const dispath = useDispatch();
  const pathname = useLocation().pathname;
  const { memorizeLoading } = useLoading();
  const MotionBox = motion.create(Box);
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

  const hight = (): string => {
    if (location.pathname === route.favorite) {
      return "650px";
    }
    if (location.pathname === route.items) {
      return "500px";
    }
    return "full";
  };

  return (
    <>
      <ComponentHeader title={menuLists[1].text} />
      {memorizeLoading && <FullScreenSpinner />}
      <VStack align={"start"}>
        <SearchForm
          tagList={memorizeTagList}
          hidden={false}
          route={pathname}
          selectedTag={memorizeSelectedTag}
        />
        <AnimatePresence mode="wait">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            w={"full"}
          >
            <Box overflowY={"scroll"} height={hight()} width={"full"}>
              <RebderItem
                itemList={memorizeItemList}
                navigate={itemDetailHanlder}
              />
            </Box>
          </MotionBox>
        </AnimatePresence>
      </VStack>
    </>
  );
};

export default Home;
