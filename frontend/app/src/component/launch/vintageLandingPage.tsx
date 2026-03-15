import { FC, useCallback } from "react";
// import FeatureCard from "../checkReactivationstatus/featureCard";
import HowItWorksSection from "./HowItWorksSection";
import {
  Box,
  Heading,
  Flex,
  // SimpleGrid,
  Icon,
  Text,
  Link,
  VStack,
  Image,
} from "@chakra-ui/react";
// import { keyframes } from "@emotion/react";
import { FaInstagram } from "react-icons/fa";
// import {
//   IoLogInOutline,
//   IoShieldCheckmarkOutline,
//   IoSwapHorizontal,
// } from "react-icons/io5";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

// カスタムキーフレームアニメーション
// const floatAnimation = keyframes`
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-10px); }
// `;

const VintageLandingPage: FC = () => {
  const navigate = useNavigate();
  const MotionBox = motion.create(Box);
  const MotionText = motion.create(Text);

  const renderTextView = useCallback(
    (text: string, index: number) => {
      return (
        <MotionText
          key={index}
          // initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          // whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          // transition={{ duration: 0.6, delay: index * 0.1 }}
          textAlign="center"
          my={2}
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
    [MotionText],
  );

  const headerTextMessages =
    "僕らのヴィンテージは古着好きのための交流プラットフォームです";

  const textMessages = [
    "古着の交換ができます。",
    "販売もできます。",
    "古着の価値は人それぞれ。",
    "本当に古着が好きな人に譲りたい。",
    "スペシャルなビンテージもいいけど、",
    "面白い古着が欲しい。",
  ];

  const bottomTextMessages = ["そんなあなたを待っています。"];

  return (
    <Box bg="#fdfcf8" minH="100vh" display="flex" flexDirection="column">
      <MotionBox
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <Box
          position="relative"
          bgImage={"/背景.svg"}
          py={24}
          px={4}
          textAlign="center"
          height={"300px"}
          backgroundPosition={"center"}
          backgroundRepeat={"no-repeat"}
          backgroundSize={"cover"}
        >
          <Heading
            fontSize={{ base: "4xl", md: "6xl" }}
            fontWeight="black"
            textShadow="0 4px 20px rgba(0,0,0,0.3)"
            mb={4}
          >
            <Image
              src={"/ロゴ.svg"}
              height={{ base: "70px", md: "82px" }}
              position={"absolute"}
              top={"45%"}
              left={"50%"}
              transform={"translate(-50%, -50%)"}
              zIndex={10}
            />
            <Text
              fontSize={"xs"}
              color={"#e68019"}
              fontWeight={"bold"}
              position={"absolute"}
              top={"60%"}
              left={0}
              right={0}
            >
              ヴィンテージをもっと楽しく、もっと自由に。
            </Text>
          </Heading>
        </Box>
      </MotionBox>

      <Box
        px={4}
        py={4}
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
          <Text
            color={"#000000"}
            fontSize={"xl"}
            fontWeight={"bold"}
            my={2}
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
            {headerTextMessages}
          </Text>
          {textMessages.map((text, index) => renderTextView(text, index))}
          {bottomTextMessages.map((text, index) => {
            return (
              <Text
                key={index}
                color={"#000000"}
                fontSize={"xl"}
                fontWeight={"bold"}
                zIndex={index}
                my={2}
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
              </Text>
            );
          })}
        </VStack>
      </Box>

      {/* Feature Cards with enhanced design */}
      {/* <MotionBox
        bg="linear-gradient(180deg, #f5f1e8 0%, #edeef4 100%)"
        py={4}
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
        <Text
          textAlign={"center"}
          mb={6}
          color={"#9b5a37"}
          fontWeight={"bold"}
          fontSize={"xl"}
        >
          僕らのヴィンテージは、
          <br />
          新しい古着交換プラットフォームです。
        </Text>
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={6}
          maxW="1200px"
          mx="auto"
        >
          <FeatureCard
            icon={IoLogInOutline}
            title="古着登録"
            desc="着なくなった服も、誰かにとればお宝なのかも。"
            index={0}
          />
          <FeatureCard
            icon={IoShieldCheckmarkOutline}
            title="欲しい古着とマッチング"
            desc="古着屋でdigする感覚でアイテムを、<br />チェック。"
            index={1}
          />
          <FeatureCard
            icon={IoSwapHorizontal}
            title="発送・受け取り"
            desc="チャットで内で発送方法を選択し、<br />アイテムを交換。"
            index={2}
          />
        </SimpleGrid>
      </MotionBox> */}

      {/* How it Works Section */}
      <HowItWorksSection />

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
      <Box textAlign="center" pt={8} pb={12} bg="#faf8f3">
        {/* <Button
          minW="80px"
          maxW="480px"
          bg="#e68019"
          color="#ece9e6ff"
          fontSize="xs"
          mb={4}
          fontWeight="bold"
          size="sm"
          boxShadow={"0 10px 30px rgba(161, 130, 73, 0.2)"}
          onClick={() => navigate(route.login)}
        >
          始める
        </Button> */}
        <Flex justify="center">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="https://www.instagram.com/bokura_no_vintage?igsh=bmJrczhubzhkYmc2&utm_source=qr"
              isExternal
            >
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
        <Text
          fontSize={"xs"}
          color="#A18249"
          mb={2}
          onClick={() => {
            navigate(route.privacy);
          }}
        >
          プライバシーポリシー
        </Text>
        <Text
          fontSize={"xs"}
          color="#A18249"
          mb={2}
          onClick={() => {
            navigate(route.terms);
          }}
        >
          利用規約
        </Text>
        <Text fontSize="sm" color="#A18249" letterSpacing="wider">
          © 2025 僕らのヴィンテージ
        </Text>
      </Box>
    </Box>
  );
};

export default VintageLandingPage;
