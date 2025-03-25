import { FC, useMemo } from "react";
import { Heading, VStack } from "@chakra-ui/react";

import ShopIndex from "./shopIndex";
import useProfile from "../../hooks/useProfile";

const Home: FC = () => {
  const { getUserProfile } = useProfile();

  const memorizeUserDate = useMemo(() => {
    return getUserProfile();
  }, [getUserProfile]);

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        textAlign={{ base: "center", md: "justify" }}
      >
        User Profile
      </Heading>
      <VStack align={"start"} mt={10}>
        <ShopIndex
          profileData={{
            profile: memorizeUserDate.profile,
            item: memorizeUserDate.items,
          }}
        />
      </VStack>
    </>
  );
};

export default Home;
