import { useEffect, useMemo, type FC } from "react";
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
    if (userItemNumver) {
      return memorizeProfile.items.filter(
        (item) => item.itemId === Number(userItemNumver)
      );
    }
  }, [memorizeProfile.items, userItemNumver]);

  useEffect(() => {
    if (memorizeProfileItem) {
      if (memorizeProfileItem.length === 0) {
        navigate(route.home);
      }
    }
  }, [memorizeProfileItem, navigate, userItemNumver]);

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
        <ItemForm profileItem={memorizeProfileItem[0]} />
      </>
    );
};

export default Home;
