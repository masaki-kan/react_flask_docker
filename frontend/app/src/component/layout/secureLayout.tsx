import { FC } from "react";
import MainHeader from "../layout/mainHeader";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import Footer from "../layout/footer";
import { route } from "../../route/routeConst";

const SecureLayout: FC = () => {
  const location = useLocation();

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bg="#f5f5f5">
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

      {/* メインコンテンツ  */}
      <Box
        flex="1"
        marginTop={{ base: "90px", md: "60px" }}
        display="flex"
        flexDirection="column"
      >
        <Container
          maxW="container.xl"
          px={{ base: 2, md: 4 }}
          py={{ base: 2, md: 4 }}
          flex="1"
          display="flex"
          flexDirection="column"
        >
          <Outlet />
        </Container>
      </Box>

      {/* フッター（プロフィールページのみ表示） */}
      {location.pathname === route.profile && (
        <Box bg="white" borderTop="1px solid" borderColor="gray.200" py={2}>
          <Footer />
        </Box>
      )}
    </Box>
  );
};

export default SecureLayout;
