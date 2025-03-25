import { useMemo, type FC } from "react";
import { Heading } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import ItemForm from "../common/form/itemForm";
import { RootState } from "../../store";
import { useSearchParams } from "react-router-dom";

const Home: FC = () => {
  const [searchParams] = useSearchParams();
  const userItemNumver = searchParams.get("userItem"); // 'userItem' パラメータの値を取得

  const profileItemrReduser = useSelector(
    (state: RootState) => state.profile.items
  );

  const memorizeProfileItem = useMemo(() => {
    return profileItemrReduser[Number(userItemNumver)];
  }, [profileItemrReduser, userItemNumver]);

  if (userItemNumver === null) return;

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "center", md: "justify" }}
      >
        Item Eidt
      </Heading>
      <ItemForm profileItem={memorizeProfileItem} />
    </>
  );
};

export default Home;
