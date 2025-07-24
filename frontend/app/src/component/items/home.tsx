import { ChangeEvent, FC, useCallback, useState } from "react";
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
} from "@chakra-ui/react";
import RebderItem from "../common/render/renderItem";
import useItems from "../../hooks/useItems";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useLoading from "../../hooks/useLaoding";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import { useDispatch } from "react-redux";
import { setTargetDetailUser } from "../../store/usersSlice";
import { AnimatePresence, motion } from "framer-motion";
import CustomTypeSelect from "../common/select/customTypeSelect";
import CustomBrandSelect from "../common/select/customBrandSelect";
import { MdClear } from "react-icons/md";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const Home: FC = () => {
  const navigate = useNavigate();
  const dispath = useDispatch();
  const { memorizeLoading } = useLoading();
  const MotionBox = motion.create(Box);
  const {
    getItemListHandler,
    typeChangeHandler,
    brandChangeHandler,
    itemFilterHandler,
    itemsFilterClearHandler,
    memorizeItemList,
    memorizeItemsSearchTypeSelect,
    memorizeItemsSearchBrandsSelect,
  } = useItems();
  const [search, setSearch] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const shadowColor = useColorModeValue(
    "0 4px 12px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.3)"
  );

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
      {memorizeLoading && <FullScreenSpinner />}
      <Box
        zIndex={1000}
        position={"sticky"}
        top={-1}
        width="100%"
        bgColor={"white"}
        border="1px solid"
        borderColor={borderColor}
        boxShadow={shadowColor}
      >
        <VStack px={2} py={2} spacing={2} width="100%">
          {/* 検索フォームヘッダー */}
          <HStack width="full" justify="space-between" align="center">
            <Box fontSize="sm" fontWeight="medium" color="gray.600">
              検索フォーム
            </Box>
            <IconButton
              aria-label="Toggle search form"
              icon={isSearchOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="sm"
              variant="ghost"
              onClick={toggleSearch}
            />
          </HStack>

          {/* 折りたたみ可能な検索フォーム */}
          <Collapse in={isSearchOpen} animateOpacity style={{ width: "100%" }}>
            <VStack spacing={4} pt={2} pb={2} width="full">
              <FormControl>
                <Input
                  bg={"white"}
                  placeholder="キーワードで検索"
                  width={"full"}
                  size="md"
                  value={search}
                  onChange={(e) => {
                    filterHandler(e);
                  }}
                />
              </FormControl>
              <Box width={"100%"}>
                <CustomTypeSelect
                  value={memorizeItemsSearchTypeSelect}
                  onChange={typeChangeHandler}
                />
              </Box>
              <Box width={"100%"}>
                <CustomBrandSelect
                  tags={memorizeItemsSearchBrandsSelect}
                  onChange={brandChangeHandler}
                />
              </Box>
              <HStack justifyContent={"end"} width={"full"}>
                <Button
                  size={"sm"}
                  leftIcon={<MdClear />}
                  onClick={filterClearHandler}
                >
                  クリア
                </Button>
              </HStack>
            </VStack>
          </Collapse>
        </VStack>
      </Box>

      <VStack align={"start"} spacing={4} mt={4} pb={4}>
        <AnimatePresence mode="wait">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            w={"full"}
          >
            <RebderItem
              itemList={memorizeItemList}
              navigate={itemDetailHanlder}
            />
          </MotionBox>
        </AnimatePresence>
      </VStack>
    </>
  );
};

export default Home;
