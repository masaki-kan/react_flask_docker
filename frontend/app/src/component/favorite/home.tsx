import { useCallback, useMemo, type FC } from "react";
import { useEffectOnce } from "react-use";
import { VStack } from "@chakra-ui/react";
import useItems from "../../hooks/useItems";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import RebderItem from "../common/render/renderItem";
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
  const { memorizeLoading } = useLaoding();

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
      {memorizeLoading && <FullScreenSpinner />}
      <VStack align={"start"}>
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
