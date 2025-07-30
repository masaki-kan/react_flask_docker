import { FC, useEffect } from "react";
import { VStack } from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import ShopIndex from "./shopIndex";
import useProfile from "../../hooks/useProfile";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

const Home: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const myProfile = useSelector((state: RootState) => state.profile);
  const userNumver = searchParams.get("user");
  const { getProfile } = useProfile();

  if (userNumver === undefined || userNumver === null) {
    navigate(route.users);
  }

  useEffect(() => {
    if (userNumver !== null) {
      // userNumver プロフ対象ユーザー myProfile.profile.id フォローしているかどうか
      getProfile(Number(userNumver), Number(myProfile.profile.id));
    }
  }, [getProfile, myProfile.profile.id, userNumver]);

  return (
    <>
      <VStack
        align={"start"}
        gap={9}
        w={"100%"}
        mt={{ base: "8em", md: "6em" }}
      >
        <ShopIndex />
      </VStack>
    </>
  );
};

export default Home;
