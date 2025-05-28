import { useCallback, useMemo, type FC } from "react";
import { useEffectOnce } from "react-use";
import { Heading, VStack, Text } from "@chakra-ui/react";
import useItems from "../../hooks/useItems";
import useLaoding from "../../hooks/useLaoding";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import RebderItem from "../common/render/renderItem";
import useProfile from "../../hooks/useProfile";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import useMyProfile from "../../hooks/useProfile";

const Home: FC = () => {
  const navigate = useNavigate();
  const { getItemListHandler, memorizeItemList } = useItems();
  const { memorizeProfile } = useMyProfile();
  const { getUserProfile } = useProfile();
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
    (index: number) => {
      if (getUserProfile().items[index] === undefined) {
        navigate(`${route.itemDetail}?number=${index}`);
        return;
      }
      navigate(`${route.itemDetail}?number=${index}`);
    },
    [getUserProfile, navigate]
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
