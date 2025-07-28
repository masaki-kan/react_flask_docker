import { FC, useCallback } from "react";
import { VStack } from "@chakra-ui/react";
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
      <RebderItem
        itemList={memorizeProfile.items}
        navigate={itemDetailHanlder}
      />
    </VStack>
  );
};

export default MyItems;
