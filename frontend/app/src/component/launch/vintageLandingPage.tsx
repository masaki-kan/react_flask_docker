import { FC, useCallback } from "react";
import FeatureCard from "../checkReactivationstatus/featureCard";
import {
  Box,
  Heading,
  Flex,
  SimpleGrid,
  Icon,
  Text,
  Link,
  VStack,
  Image,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaInstagram } from "react-icons/fa";
import {
  IoLogInOutline,
  IoShieldCheckmarkOutline,
  IoSwapHorizontal,
} from "react-icons/io5";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

// カスタムキーフレームアニメーション
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const VintageLandingPage: FC = () => {
  const navigate = useNavigate();
  const MotionBox = motion.create(Box);
  const MotionText = motion.create(Text);

  const renderTextView = useCallback(
    (text: string, index: number) => {
      return (
        <MotionText
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          textAlign="center"
          my={3}
          fontWeight="bold"
          fontSize={{ base: "md", md: "lg" }}
          color="#1C160C"
          position="relative"
          _after={{
            content: '""',
            position: "absolute",
            bottom: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0%",
            height: "2px",
            bg: "#e68019",
            transition: "width 0.3s ease-in-out",
          }}
          _hover={{
            color: "#e68019",
            _after: {
              width: "80%",
            },
          }}
        >
          {text}
        </MotionText>
      );
    },
    [MotionText]
  );

  const textMessages = [
    "古着ってこんなに高かったっけ？",
    "新品にはない、あの空気感に憧れて",
    "町の古着屋をまわったあの頃。",
    "今は着なくなったあの服も、",
    "誰かのもとでもう一度輝ける。",
    "スーパーなヴィンテージじゃないし、",
    "買い取りに出しても、二束三文。",
    "それなら、みんなで着まわす方が絶対楽しい。",
  ];

  return (
    <Box bg="#fdfcf8" minH="100vh" display="flex" flexDirection="column">
      {/* Hero Section with parallax effect */}
      <MotionBox
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <Box
          position="relative"
          overflow="hidden"
          bgImage="linear-gradient(rgba(28, 22, 12, 0.3), rgba(28, 22, 12, 0.6)), url('https://cdn.usegalileo.ai/sdxl10/e3fe2854-4f36-4375-893a-e081d9b8899a.png')"
          bgSize="cover"
          bgPosition="center"
          bgAttachment="fixed"
          py={24}
          px={4}
          textAlign="center"
          color="white"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Heading
              fontSize={{ base: "4xl", md: "6xl" }}
              fontWeight="black"
              textShadow="0 4px 20px rgba(0,0,0,0.3)"
              mb={4}
            >
              <Image
                src={"/ロゴ.svg"}
                height="82px"
                mx={"auto"}
                textTransform="uppercase"
              />
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Text
              mt={2}
              fontSize={{ base: "md", md: "lg" }}
              textShadow="0 2px 10px rgba(0,0,0,0.3)"
              maxW="600px"
              mx="auto"
            >
              2025年秋ローンチ予定。
              <br />
              ヴィンテージをもっと楽しく, もっと自由に。
            </Text>
          </motion.div>
        </Box>
      </MotionBox>

      {/* Story Section with stagger animation */}
      <Box
        px={4}
        py={16}
        textAlign="center"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "80%",
          height: "80%",
          background:
            "radial-gradient(circle, rgba(230, 128, 25, 0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      >
        <VStack
          spacing={0}
          maxW="700px"
          mx="auto"
          position="relative"
          zIndex={1}
        >
          {textMessages.map((text, index) => renderTextView(text, index))}
        </VStack>
      </Box>

      {/* Feature Cards with enhanced design */}
      <MotionBox
        bg="linear-gradient(180deg, #f5f1e8 0%, #edeef4 100%)"
        py={16}
        px={4}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(230, 128, 25, 0.03) 0%, transparent 50%)",
          animation: `${floatAnimation} 20s ease-in-out infinite`,
        }}
      >
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={6}
          maxW="1200px"
          mx="auto"
        >
          <FeatureCard
            icon={IoLogInOutline}
            title="古着登録"
            desc="古着を登録"
            index={0}
          />
          <FeatureCard
            icon={IoShieldCheckmarkOutline}
            title="欲しい古着とマッチング"
            desc="いい感じの古着を探す"
            index={1}
          />
          <FeatureCard
            icon={IoSwapHorizontal}
            title="発送・受け取り"
            desc="チャットで発送方法を登録"
            index={2}
          />
        </SimpleGrid>
      </MotionBox>

      {/* CTA Section */}
      <MotionBox
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        px={4}
        pt={10}
        pb={6}
        textAlign="center"
      >
        <Text
          fontSize={{ base: "md", md: "xl" }}
          color="#A18249"
          fontWeight="medium"
          position="relative"
          display="inline-block"
          _after={{
            content: '""',
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "3px",
            bg: "#e68019",
            borderRadius: "full",
          }}
        >
          あなたも古着を着まわす"仲間"になりませんか？
        </Text>
      </MotionBox>

      {/* Footer */}
      <Box textAlign="center" py={12} bg="#faf8f3">
        <Flex justify="center" mb={6}>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="https://chakra-ui.com" isExternal>
              <Icon
                as={FaInstagram}
                boxSize={8}
                color="#A18249"
                _hover={{ color: "#e68019" }}
                transition="color 0.3s"
              />
            </Link>
          </motion.div>
        </Flex>
        <Text
          fontSize={"xs"}
          color="#A18249"
          mb={2}
          onClick={() => {
            navigate(route.tokushoho);
          }}
        >
          特定商取引法に基づく表記
        </Text>
        <Text fontSize="sm" color="#A18249" letterSpacing="wider">
          © 2025 僕らのヴィンテージ
        </Text>
      </Box>
    </Box>
  );
};

export default VintageLandingPage;
