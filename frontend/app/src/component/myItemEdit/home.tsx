import { useMemo, type FC } from "react";
import ItemForm from "../form/itemForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import useMyProfile from "../../hooks/useProfile";
import { route } from "../../route/routeConst";
import FullScreenSpinner from "../spliner/FullScreenSpinner";
import useLaoding from "../../hooks/useLaoding";

const Home: FC = () => {
  const [searchParams] = useSearchParams();
  const { memorizeLoading } = useLaoding();
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
        {memorizeLoading && <FullScreenSpinner />}
        <ItemForm
          profileItem={memorizeProfileItem[0]}
          ItemNumver={userItemNumver}
        />
      </>
    );
};

export default Home;
