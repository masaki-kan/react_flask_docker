import { FC } from "react";
import MainHeader from "../layout/mainHeader";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import Footer from "../layout/footer";
import { route } from "../../route/routeConst";

const SecureLayout: FC = () => {
  const location = useLocation();

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {/* ヘッダーをアニメーション付きで表示/非表示 */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        boxShadow="sm"
        zIndex={1000}
        transform={"translateY(0)"}
        transition="transform 0.3s ease-in-out"
      >
        <MainHeader />
      </Box>

      {/* ヘッダーの高さ分のスペーサー */}
      <Box height="90px" flexShrink={0} />

      {/* メインコンテンツ（スクロール可能） */}
      <Box
        flex="1"
        bg="#f5f5f5"
        overflowY="auto"
        overflowX="hidden"
        minHeight={0}
        className="main-scroll-container"
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
          "-webkit-overflow-scrolling": "touch",
        }}
      >
        <Container
          maxW="container.xl"
          px={{ base: 2, md: 4 }}
          py={4}
          minHeight="100%"
        >
          <Outlet />
        </Container>
      </Box>

      {/* フッターを固定 */}
      <Box
        flexShrink={0}
        hidden={location.pathname !== route.profile}
        bg="white"
        boxShadow="0 -2px 4px rgba(0,0,0,0.1)"
        borderTop="1px solid"
        borderColor="gray.200"
      >
        <Footer />
      </Box>
    </Box>
  );
};

export default SecureLayout;
