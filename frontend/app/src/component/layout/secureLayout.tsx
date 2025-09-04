import { FC } from "react";
import MainHeader from "../layout/mainHeader";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import Footer from "../layout/footer";
import { route } from "../../route/routeConst";
// import { useAuth } from "../../provider/authContext";

const SecureLayout: FC = () => {
  const location = useLocation();

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      position="relative"
      bg="#f5f5f5"
    >
      {/* ヘッダー固定 */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        zIndex={1100}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <MainHeader />
      </Box>

      {/* メインコンテンツ（スクロール可能） */}
      <Box
        flex="1"
        paddingTop={{ base: "100px", md: "60px" }}
        overflowY="auto"
        overflowX="hidden"
        position="relative"
        className="main-scroll-container"
        css={{
          // スマホでのスムーズスクロール対応
          WebkitOverflowScrolling: "touch",
          overflowScrolling: "touch",
          // スクロールバー非表示（モバイル）
          "&::-webkit-scrollbar": {
            width: "0px",
            background: "transparent",
            display: "none",
          },
          // デスクトップではスクロールバー表示
          "@media (min-width: 768px)": {
            "&::-webkit-scrollbar": {
              width: "8px",
              display: "block",
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
          },
          // iOS Safari 固有の問題対応
          "@supports (-webkit-touch-callout: none)": {
            transform: "translate3d(0,0,0)",
            willChange: "transform",
          },
        }}
      >
        <Container
          maxW="container.xl"
          px={{ base: 2, md: 4 }}
          py={{ base: 2, md: 4 }}
          minHeight="calc(100vh - 80px)"
        >
          <Outlet />
        </Container>

        {/* 下部余白でスクロール終端を確保（フッターがある場合は追加余白） */}
        <Box
          height={{
            base: location.pathname === route.profile ? "80px" : "20px",
            md: location.pathname === route.profile ? "100px" : "40px",
          }}
        />
      </Box>

      {/* フッター（プロフィールページのみ固定表示） */}
      {location.pathname === route.profile && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          boxShadow="0 -2px 4px rgba(0,0,0,0.1)"
          borderTop="1px solid"
          borderColor="gray.200"
          zIndex={1050}
        >
          <Footer />
        </Box>
      )}
    </Box>
  );
};

export default SecureLayout;
