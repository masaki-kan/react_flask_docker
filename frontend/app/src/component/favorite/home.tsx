import { useCallback, useMemo, type FC } from "react";
import { useEffectOnce } from "react-use";
import { VStack } from "@chakra-ui/react";
import useItems from "../../hooks/useItems";
import RebderItem from "../render/renderItem";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import useMyProfile from "../../hooks/useProfile";
import { useDispatch } from "react-redux";
import { setTargetDetailUser } from "../../store/usersSlice";

const Home: FC = () => {
  const navigate = useNavigate();
  const dispath = useDispatch();
  const { getItemListHandler, memorizeItemList } = useItems();
  const { memorizeProfile } = useMyProfile();

  const likedFileterList = useMemo(() => {
    return memorizeItemList.filter((item) =>
      memorizeProfile.profile.likes.includes(Number(item.itemId))
    );
  }, [memorizeItemList, memorizeProfile.profile.likes]);

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

      return;
    },
    [dispath, navigate]
  );

  return (
    <>
      <VStack align={"start"} h={"100vh"}>
        <RebderItem
          itemList={likedFileterList}
          avatar={false}
          navigate={itemDetailHanlder}
        />
      </VStack>
    </>
  );
};

export default Home;
