import { useMemo, type FC } from "react";
import { Heading } from "@chakra-ui/react";
import ItemForm from "../common/form/itemForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import useMyProfile from "../../hooks/useProfile";
import { route } from "../../route/routeConst";

const Home: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const userItemNumver = searchParams.get("userItem");
  const memorizeProfileItem = useMemo(() => {
    return memorizeProfile.items.filter(
      (item) => String(item.itemId) === String(userItemNumver)
    );
  }, [memorizeProfile, userItemNumver]);

  if (userItemNumver === null || !userItemNumver) {
    navigate(route.home);

    return;
  }

  if (memorizeProfileItem !== undefined)
    return (
      <>
        <Heading
          pl={{ md: 4, base: 0 }}
          mb={10}
          textAlign={{ base: "center", md: "justify" }}
        >
          Item Eidt
        </Heading>
        <ItemForm
          profileItem={memorizeProfileItem[0]}
          ItemNumver={userItemNumver}
        />
      </>
    );
};

export default Home;
