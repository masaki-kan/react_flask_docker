import { FC, useCallback } from "react";
import MainHeader from "../common/layout/mainHeader";
import { Outlet } from "react-router-dom";
import { Box, Container, Flex } from "@chakra-ui/react";
import Footer from "../common/layout/footer";
import ComponentHeader from "../common/layout/componentHeader";
import { menuLists } from "../../consts/menuList";
import { useLocation } from "react-router-dom";
import { route } from "../../route/routeConst";

const SecureLayout: FC = () => {
  const location = useLocation();

  const pageTitleView = useCallback(() => {
    switch (location.pathname) {
      case route.users:
        return menuLists[0].text;
      case route.items:
        return menuLists[1].text;

      case route.favorite:
        return menuLists[2].text;

      case route.saved:
        return menuLists[3].text;

      case route.itemDetail:
        return "アイテム詳細";

      case route.transactionChat:
        return "交換やりとり";

      case route.myItem:
        return "商品登録";

      case route.myItemEdit:
        return "商品編集";
    }

    return "";
  }, [location.pathname]);

  return (
    <>
      <Flex direction="column" h="100vh">
        {/* ヘッダーを固定 */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          bg="white"
          boxShadow="sm"
        >
          <MainHeader />
        </Box>
        <Box
          hidden={
            location.pathname === route.home ||
            location.pathname === route.myItem ||
            location.pathname === route.myItemEdit
          }
          mt={{ base: "8em", md: "6em" }} // ヘッダーの高さ分のマージン
        >
          <Container maxW="container.xl" py={4}>
            <ComponentHeader title={pageTitleView()} />
          </Container>
        </Box>

        {/* スクロール可能なメインコンテンツ */}
        <Box
          flex={1}
          mb="50px" // フッターの高さ分のマージン（調整必要）
          overflowY="auto"
          overflowX="hidden"
        >
          <Container maxW="container.xl">
            <Outlet />
          </Container>
        </Box>
        {/* フッターを固定 */}
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          zIndex={1000}
          bg="white"
          boxShadow="0 -2px 4px rgba(0,0,0,0.1)"
        >
          <Footer />
        </Box>
      </Flex>
    </>
  );
};

export default SecureLayout;
