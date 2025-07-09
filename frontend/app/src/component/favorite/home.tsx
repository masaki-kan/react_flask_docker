import { useCallback, useMemo, type FC } from "react";
import { useEffectOnce } from "react-use";
import { Heading, VStack, Text } from "@chakra-ui/react";
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
          userName: memorizeItemList[0].user_name,
          userId: "",
          itemId: index,
        })
      );
      navigate(`${route.itemDetail}`);

      return;
    },
    [dispath, memorizeItemList, navigate]
  );

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Favorite
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <VStack align={"start"} mt={10}>
        {likedFileterList.length === 0 && (
          <Text px={4}>現在お気に入り件数はありません。</Text>
        )}
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
