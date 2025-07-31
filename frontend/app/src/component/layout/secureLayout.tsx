import { FC, useCallback } from "react";
import MainHeader from "../layout/mainHeader";
import { Outlet } from "react-router-dom";
import { Box, Container, Flex } from "@chakra-ui/react";
import Footer from "../layout/footer";
import ComponentHeader from "../layout/componentHeader";
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

  const shouldShowComponentHeader = !(
    location.pathname === route.home ||
    location.pathname === route.myItem ||
    location.pathname === route.myItemEdit ||
    location.pathname === route.archiveDetail ||
    location.pathname === route.shopPage ||
    location.pathname === route.thread
  );

  return (
    <Flex direction="column" h="100vh" position="relative">
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

      {/* メインコンテンツエリア */}
      <Box
        flex={1}
        mt={{ base: "7rem", md: "4rem" }}
        mb={{ base: "9rem", md: "4rem" }}
        overflowY="auto"
        overflowX="hidden"
        position="relative"
      >
        {shouldShowComponentHeader && (
          <Container maxW="container.xl" py={4}>
            <ComponentHeader title={pageTitleView()} />
          </Container>
        )}

        {/* スクロール可能なコンテンツ */}
        <Container maxW="container.xl" px={{ base: 2, md: 4 }} py={4}>
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
  );
};

export default SecureLayout;
