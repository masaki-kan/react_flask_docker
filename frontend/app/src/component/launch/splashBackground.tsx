import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";

const MotionBox = motion.create(Box);

// ヴィンテージ感のあるノイズパターン
const noiseAnimation = keyframes`
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(-10%, 5%); }
  30% { transform: translate(5%, -10%); }
  40% { transform: translate(-5%, 15%); }
  50% { transform: translate(-10%, 5%); }
  60% { transform: translate(15%, 0); }
  70% { transform: translate(0, 10%); }
  80% { transform: translate(-15%, 0); }
  90% { transform: translate(10%, 5%); }
`;

const SplashBackground = () => {
  return (
    <>
      {/* メインの円形エクスパンド */}
      <MotionBox
        position="fixed"
        top="50%"
        left="50%"
        width="200vh"
        height="200vh"
        marginTop="-100vh"
        marginLeft="-100vh"
        backgroundColor="#e68019"
        borderRadius="50%"
        zIndex={999}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, #e68019 0%, #d67316 50%, #c56514 100%)",
        }}
      />

      {/* セカンダリーの装飾的な円 */}
      <MotionBox
        position="fixed"
        top="50%"
        left="50%"
        width="150vh"
        height="150vh"
        marginTop="-75vh"
        marginLeft="-75vh"
        borderRadius="50%"
        zIndex={998}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 1.2, opacity: 0 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
          delay: 0.2,
        }}
        border="3px solid #e68019"
      />

      {/* ヴィンテージノイズエフェクト */}
      <Box
        position="fixed"
        top="-50%"
        left="-50%"
        right="-50%"
        bottom="-50%"
        zIndex={1000}
        opacity={0.03}
        pointerEvents="none"
        animation={`${noiseAnimation} 0.2s infinite`}
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
          mixBlendMode: "multiply",
        }}
      />

      {/* 光のフレア効果 */}
      <MotionBox
        position="fixed"
        top="50%"
        left="50%"
        width="100px"
        height="100px"
        marginTop="-50px"
        marginLeft="-50px"
        borderRadius="50%"
        zIndex={1001}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 20, opacity: 0 }}
        transition={{
          duration: 1,
          ease: "easeOut",
          delay: 0.3,
        }}
        background="radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)"
        filter="blur(10px)"
      />
    </>
  );
};

export default SplashBackground;
