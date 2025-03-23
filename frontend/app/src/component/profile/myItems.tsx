import { FC, useCallback, useEffect } from "react";
import { Text, VStack, HStack, Button } from "@chakra-ui/react";

import { MdOutlineShoppingBag } from "react-icons/md";
import useMyProfile from "../../hooks/useMyProfile";
import RebderItem from "../common/renderItem";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

const MyItems: FC = () => {
  const navigate = useNavigate();
  const { getMyProfile, memorizeProfile } = useMyProfile();

  useEffect(() => {
    getMyProfile();
  }, []);

  const toItemPushHandler = useCallback(() => {
    navigate(route.myItem);
  }, [navigate]);

  const itemDetailHanlder = useCallback(() => {
    navigate(route.myItemEdit);
  }, [navigate]);

  return (
    <VStack align={"start"} w={"full"}>
      <HStack justifyContent={"space-between"} w={"full"} alignItems={"center"}>
        <Text size={"sm"} mr={10}>
          登録商品
        </Text>
        <Button leftIcon={<MdOutlineShoppingBag />} onClick={toItemPushHandler}>
          登録ページ
        </Button>
      </HStack>
      <RebderItem
        itemList={memorizeProfile.items}
        navigate={itemDetailHanlder}
      />
    </VStack>
  );
};

export default MyItems;
