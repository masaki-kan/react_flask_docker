import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const SplashBackground = () => {
  return (
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
      initial={{ scaleX: 0, skewX: "-45deg" }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
    />
  );
};

export default SplashBackground;
