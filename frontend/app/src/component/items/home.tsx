import { ChangeEvent, FC, useCallback, useState, useEffect } from "react";
import {
  VStack,
  Box,
  useColorModeValue,
  FormControl,
  Input,
  Button,
  HStack,
  Collapse,
  IconButton,
  Center,
  Spinner,
  Text,
  Container,
} from "@chakra-ui/react";
import RebderItem from "../render/renderItem";
import useItems from "../../hooks/useItems";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import { useEffectOnce } from "react-use";
import { useDispatch } from "react-redux";
import { setTargetDetailUser } from "../../store/usersSlice";
import { AnimatePresence, motion } from "framer-motion";
import CustomTypeSelect from "../select/customTypeSelect";
import CustomBrandSelect from "../select/customBrandSelect";
import { MdClear } from "react-icons/md";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const Home: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const MotionBox = motion.create(Box);
  const {
    getItemListHandler,
    loadMoreItems,
    typeChangeHandler,
    brandChangeHandler,
    itemFilterHandler,
    itemsFilterClearHandler,
    memorizeItemList,
    memorizeItemsSearchTypeSelect,
    memorizeItemsSearchBrandsSelect,
    hasMore,
    isLoading,
  } = useItems();

  const [search, setSearch] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const shadowColor = useColorModeValue(
    "0 4px 12px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.3)"
  );

  useEffectOnce(() => {
    getItemListHandler();
  });

  // スクロールでさらに読み込み（ウィンドウスクロールに変更）
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const { scrollY } = window;
      const { scrollHeight, clientHeight } = document.documentElement;

      if (scrollY + clientHeight >= scrollHeight - 100) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, loadMoreItems]);

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

  const filterHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      itemFilterHandler(value);
    },
    [itemFilterHandler]
  );

  const filterClearHandler = useCallback(() => {
    setSearch("");
    itemsFilterClearHandler();
  }, [itemsFilterClearHandler]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  return (
    <>
      <Box
        position="fixed"
        top={{ base: "110px", md: "80px" }} // ヘッダーの高さに合わせて調整
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
                検索
              </Box>
              <IconButton
                aria-label="Toggle search form"
                icon={isSearchOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                size="sm"
                variant="ghost"
                onClick={toggleSearch}
              />
            </HStack>
            {/* 検索フォームの内容 */}
          </VStack>
          {/* 折りたたみ可能な検索フォーム */}
          <Collapse in={isSearchOpen} animateOpacity style={{ width: "100%" }}>
            <VStack
              spacing={4}
              p={2}
              width="full"
              bg="#ffffff"
              mt={1}
              borderRadius="md"
            >
              <FormControl>
                <Input
                  bg="white"
                  placeholder="キーワードで検索"
                  width="full"
                  size="md"
                  value={search}
                  onChange={filterHandler}
                />
              </FormControl>
              <Box width="100%">
                <CustomTypeSelect
                  value={memorizeItemsSearchTypeSelect}
                  onChange={typeChangeHandler}
                />
              </Box>
              <Box width="100%">
                <CustomBrandSelect
                  tags={memorizeItemsSearchBrandsSelect}
                  onChange={brandChangeHandler}
                />
              </Box>
              <HStack justifyContent="end" width="full">
                <Button
                  size="sm"
                  leftIcon={<MdClear />}
                  onClick={filterClearHandler}
                >
                  クリア
                </Button>
              </HStack>
            </VStack>
          </Collapse>
        </Container>
      </Box>

      <Box h={{ base: "60px", md: isSearchOpen ? "300px" : "80px" }} />

      {/* コンテンツエリア */}
      <Box pb={24}>
        <AnimatePresence mode="wait">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            w="full"
          >
            <RebderItem
              itemList={memorizeItemList}
              navigate={itemDetailHandler}
            />

            {isLoading && (
              <Center py={4}>
                <Spinner size="lg" />
              </Center>
            )}

            {!hasMore && memorizeItemList.length > 0 && (
              <Center py={4}>
                <Text color="gray.500">すべての商品を読み込みました</Text>
              </Center>
            )}
          </MotionBox>
        </AnimatePresence>
      </Box>
    </>
  );
};

export default Home;
