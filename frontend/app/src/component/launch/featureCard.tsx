import { FC } from "react";
import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";

// カスタムキーフレームアニメーション
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

type FeatureCardType = {
  icon: IconType;
  title: string;
  desc: string;
  index: number;
};
const FeatureCard: FC<FeatureCardType> = ({ icon, title, desc, index }) => {
  const MotionFlex = motion.create(Flex);

  return (
    <MotionFlex
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px rgba(161, 130, 73, 0.2)",
      }}
      flexDir="column"
      p={6}
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor="transparent"
      borderRadius="xl"
      bg="white"
      gap={4}
      cursor="pointer"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(45deg, transparent 30%, rgba(230, 128, 25, 0.1) 50%, transparent 70%)",
        backgroundSize: "200% 200%",
        animation: `${shimmer} 3s ease-in-out infinite`,
        borderRadius: "xl",
        zIndex: 0,
      }}
    >
      <Box
        position="relative"
        zIndex={1}
        p={3}
        bg="rgba(230, 128, 25, 0.1)"
        borderRadius="full"
        w="fit-content"
        animation={`${floatAnimation} 3s ease-in-out infinite`}
        transitionDelay={`${index * 0.3}s`}
      >
        <Icon as={icon} boxSize={8} color="#e68019" />
      </Box>
      <VStack align="start" spacing={2} position="relative" zIndex={1}>
        <Text fontWeight="bold" fontSize="lg" color="#1C160C">
          {title}
        </Text>
        <Text fontSize="sm" color="#A18249" lineHeight="1.6">
          {desc}
        </Text>
      </VStack>
    </MotionFlex>
  );
};

export default FeatureCard;
