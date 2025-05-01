import { FC } from "react";
import { Heading, VStack } from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import ShopIndex from "./shopIndex";
import useProfile from "../../hooks/useProfile";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import useLaoding from "../../hooks/useLaoding";

const Home: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { memorizeLoading } = useLaoding();
  const myProfile = useSelector((state: RootState) => state.profile);
  const userNumver = searchParams.get("userItem");
  const { getProfile } = useProfile();

  if (userNumver === undefined || userNumver === null) {
    navigate(route.users);
  }

  useEffectOnce(() => {
    if (userNumver !== null) {
      // userNumver プロフ対象ユーザー myProfile.profile.id フォローしているかどうか
      getProfile(userNumver, myProfile.profile.id);
    }
  });

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        textAlign={{ base: "center", md: "justify" }}
      >
        User Profile
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <VStack align={"start"} mt={10}>
        <ShopIndex />
      </VStack>
    </>
  );
};

export default Home;
