import { FC, useCallback } from "react";
import { Text, VStack, HStack, Button } from "@chakra-ui/react";

import { MdOutlineShoppingBag } from "react-icons/md";
import useMyProfile from "../../hooks/useProfile";
import RebderItem from "../common/render/renderItem";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

const MyItems: FC = () => {
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();

  const toItemPushHandler = useCallback(() => {
    navigate(route.myItem);
  }, [navigate]);

  const itemDetailHanlder = useCallback(
    (index: string) => {
      navigate(`${route.myItemEdit}?userItem=${index}`);
    },
    [navigate]
  );

  return (
    <VStack align={"start"} w={"full"}>
      <HStack
        justifyContent={{ base: "space-between", md: "start" }}
        w={"full"}
        alignItems={"center"}
      >
        <Text size={"sm"} mr={10}>
          登録商品
        </Text>
        <Button
          size={"sm"}
          leftIcon={<MdOutlineShoppingBag />}
          onClick={toItemPushHandler}
        >
          登録ページ
        </Button>
      </HStack>
      {memorizeProfile.items.length === 0 ? (
        <Text size={"xs"} color={"#887563"}>
          商品がありません。
        </Text>
      ) : (
        <RebderItem
          itemList={memorizeProfile.items}
          navigate={itemDetailHanlder}
        />
      )}
    </VStack>
  );
};

export default MyItems;
