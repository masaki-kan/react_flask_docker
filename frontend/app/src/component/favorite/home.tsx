import { useCallback, useMemo, type FC, useEffect } from "react";
import { useEffectOnce } from "react-use";
import {
  Box,
  Center,
  Container,
  HStack,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
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
  const shadowColor = useColorModeValue(
    "0 4px 12px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.3)"
  );

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
    <Box>
      <Box
        position="fixed"
        top={{ base: "110px", md: "110px" }} // ヘッダーの高さに合わせて調整
        left={0}
        right={0}
        zIndex={999}
        px={4}
      >
        <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
          <VStack
            px={2}
            py={2}
            spacing={2}
            width="100%"
            bgColor="white"
            boxShadow={shadowColor}
            borderRadius="md"
          >
            {/* 検索フォームヘッダー */}
            <HStack width="full" justify="space-between" align="center">
              <Box fontSize="sm" fontWeight="medium" color="gray.600">
                お気に入り
              </Box>
            </HStack>
            {/* 検索フォームの内容 */}
          </VStack>
        </Container>
      </Box>

      <Box h={{ base: "100px", md: "80px" }} />
      <Box pb={24}>
        <AnimatePresence mode="wait">
          <Box pt={"5rem"}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              w="full"
            >
              {" "}
              <RebderItem
                itemList={likedFilterList}
                avatar={false}
                navigate={itemDetailHandler}
              />
            </MotionBox>

            {isLoading && (
              <Center py={4}>
                <Spinner size="lg" />
              </Center>
            )}

            {!hasMore && likedFilterList.length > 0 && (
              <Center py={4}>
                <Text color="gray.500">すべての商品を読み込みました</Text>
              </Center>
            )}

            {likedFilterList.length === 0 && !isLoading && (
              <Center py={8}>
                <Text color="gray.500" fontSize="lg">
                  お気に入りの商品はありません
                </Text>
              </Center>
            )}
          </Box>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Home;
