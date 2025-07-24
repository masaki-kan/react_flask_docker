import { ChangeEvent, FC, useCallback, useState } from "react";
import {
  VStack,
  Box,
  useColorModeValue,
  FormControl,
  Input,
  Button,
  HStack,
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

  return (
    <>
      {memorizeLoading && <FullScreenSpinner />}
      <VStack
        zIndex={1000}
        position={"sticky"}
        top={-1}
        px={2}
        py={4}
        bgColor={"white"}
        spacing={4}
        border="1px solid"
        borderColor={borderColor}
        boxShadow={shadowColor}
      >
        <FormControl>
          <Input
            bg={"white"}
            placeholder="キーワードで検索"
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

      <VStack align={"start"} spacing={4} mt={4}>
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
