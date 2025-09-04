import { useCallback, useMemo, type FC, useEffect } from "react";
import { useEffectOnce } from "react-use";
import {
  Box,
  Center,
  // Container,
  // HStack,
  Spinner,
  Text,
  // useColorModeValue,
  // VStack,
} from "@chakra-ui/react";
import useItems from "../../hooks/useItems";
import RebderItem from "../render/renderItem";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import useMyProfile from "../../hooks/useProfile";
import { useDispatch } from "react-redux";
import { setTargetDetailUser } from "../../store/usersSlice";
import { AnimatePresence, motion } from "framer-motion";

const Home: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const MotionBox = motion.create(Box);
  const {
    getItemListHandler,
    memorizeItemList,
    isLoading,
    hasMore,
    loadMoreItems,
  } = useItems();
  const { memorizeProfile } = useMyProfile();
  // const shadowColor = useColorModeValue(
  //   "0 4px 12px rgba(0, 0, 0, 0.08)",
  //   "0 4px 12px rgba(0, 0, 0, 0.3)"
  // );

  const likedFilterList = useMemo(() => {
    return memorizeItemList.filter((item) =>
      memorizeProfile.profile.likes.includes(Number(item.itemId))
    );
  }, [memorizeItemList, memorizeProfile.profile.likes]);

  useEffectOnce(() => {
    getItemListHandler();
  });

  const itemDetailHandler = useCallback(
    (index: string) => {
      dispatch(
        setTargetDetailUser({
          itemId: index,
        })
      );
      navigate(`${route.itemDetail}`);
    },
    [dispatch, navigate]
  );

  // スクロールでさらに読み込み
  useEffect(() => {
    const scrollContainer = document.querySelector(".main-scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreItems();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, loadMoreItems]);

  return (
    <Box pb={24} pt={4}>
      <MotionBox
        key="item-list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        w="full"
      >
        <RebderItem
          itemList={likedFilterList}
          avatar={false}
          navigate={itemDetailHandler}
        />
      </MotionBox>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Center py={4}>
              <Spinner size="lg" />
            </Center>
          </motion.div>
        )}

        {!hasMore && likedFilterList.length > 0 && (
          <motion.div
            key="all-loaded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Center py={4}>
              <Text color="gray.500">すべての商品を読み込みました</Text>
            </Center>
          </motion.div>
        )}

        {likedFilterList.length === 0 && !isLoading && (
          <motion.div
            key="no-items"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Center py={8}>
              <Text color="gray.500" fontSize="lg">
                お気に入りの商品はありません
              </Text>
            </Center>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Home;
