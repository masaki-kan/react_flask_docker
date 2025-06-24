import { FC, useEffect, useState } from "react";
import { Box, Center, Text } from "@chakra-ui/react";
import VintageLandingPage from "./vintageLandingPage";
import { AnimatePresence } from "framer-motion";
import SplashBackground from "./splashBackground";

const Home: FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // 一定時間後に非表示へ
    }, 2500); // 2.5秒間表示

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <Box position="relative" w="100vw" h="100vh">
            <SplashBackground />
            <Center h="100vh" zIndex={1000} position="relative">
              {/* <Image src="/logo.png" boxSize="120px" /> */}
              <Text fontSize={"xl"} fontWeight={"bold"} mb={10}>
                僕らのヴィンテージ
              </Text>
            </Center>
          </Box>
        )}
      </AnimatePresence>
      {!showSplash && <VintageLandingPage />}
    </>
  );
};
export default Home;
