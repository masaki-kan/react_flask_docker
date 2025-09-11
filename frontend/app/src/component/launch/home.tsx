import { FC, useEffect, useState } from "react";
import { Box, Center, Text, Image } from "@chakra-ui/react";
import VintageLandingPage from "./vintageLandingPage";
import { AnimatePresence, motion } from "framer-motion";
import SplashBackground from "./splashBackground";
import { keyframes } from "@emotion/react";

// タイプライター風のアニメーション
const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const Home: FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const MotionCenter = motion.create(Center);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800); // 少し長めに

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <Box position="relative" w="100vw" h="100vh" overflow="hidden">
            <SplashBackground />
            <MotionCenter
              h="100vh"
              zIndex={1002}
              position="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <Box position="relative">
                {/* ロゴテキスト */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  }}
                >
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="black"
                    color="white"
                    letterSpacing="wider"
                    textShadow="0 4px 20px rgba(0,0,0,0.3)"
                    position="relative"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    _after={{
                      content: '""',
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "2px",
                      bg: "white",
                      animation: `${blink} 1s infinite`,
                      animationDelay: "1.5s",
                    }}
                  >
                    {/* <Box
                      as="span"
                      display="inline-block"
                      overflow="hidden"
                      animation={`${typewriter} 1.5s steps(10) 0.8s forwards`}
                      maxW="0"
                      whiteSpace="nowrap"
                    >
                      僕らのヴィンテージ
                    </Box> */}
                    <Image
                      src={"/ロゴ.svg"}
                      height="35px"
                      overflow="hidden"
                      display="inline-block"
                      maxW="0"
                      animation={`${typewriter} 1.5s steps(10) 0.8s forwards`}
                    />
                  </Text>
                </motion.div>

                {/* サブテキスト */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2 }}
                  style={{ marginTop: "8px" }}
                >
                  {/* <Text
                    fontSize={{ base: "md", md: "sm" }}
                    color="rgba(255,255,255,0.8)"
                    letterSpacing="widest"
                    textTransform="uppercase"
                  >
                    僕らのヴィンテージ
                  </Text> */}
                  <Image
                    src={"/ロゴ.svg"}
                    height="35px"
                    textTransform="uppercase"
                  />
                </motion.div>

                {/* 装飾的な要素 */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80px",
                    height: "2px",
                    background: "rgba(255,255,255,0.6)",
                  }}
                />
              </Box>
            </MotionCenter>
          </Box>
        )}
      </AnimatePresence>
      {!showSplash && <VintageLandingPage />}
    </>
  );
};

export default Home;
