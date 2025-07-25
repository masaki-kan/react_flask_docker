import { FC, useCallback } from "react";
import { Text, VStack } from "@chakra-ui/react";
import useMyProfile from "../../hooks/useProfile";
import RebderItem from "../common/render/renderItem";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

const MyItems: FC = () => {
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();

  const itemDetailHanlder = useCallback(
    (index: string) => {
      navigate(`${route.myItemEdit}?userItem=${index}`);
    },
    [navigate]
  );

  return (
    <VStack align={"start"} w={"full"}>
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
