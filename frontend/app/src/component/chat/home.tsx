import { FC } from "react";
import { Heading, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useLoading from "../../hooks/useLaoding";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import useChat from "../../hooks/useChat";
import ChatLeft from "./chatLeft";
import ChatRight from "./chatRight";

const Home: FC = () => {
  const navigate = useNavigate();
  const { getItemDetail, fetchMessages } = useChat();
  const { memorizeLoading } = useLoading();
  const searchParams = new URLSearchParams(location.search);
  const tradeIdNumver = searchParams.get("item_id");
  const userIdNumver = searchParams.get("user_id");
  if (tradeIdNumver === undefined || userIdNumver === undefined) {
    navigate(route.saved);
  }

  useEffectOnce(() => {
    if (tradeIdNumver !== null) {
      fetchMessages(tradeIdNumver, userIdNumver);
      getItemDetail(tradeIdNumver);
    }
  });

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Saved
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <Flex
        direction={{ base: "column", md: "row" }} // スマホでは縦並び、タブレット以上では横並び
        alignItems="start"
        mb={6}
      >
        <ChatLeft />
        <ChatRight />
      </Flex>
    </>
  );
};

export default Home;
