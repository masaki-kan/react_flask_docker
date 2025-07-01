import { FC, useCallback } from "react";
import FeatureCard from "./featureCard";
import {
  Box,
  Heading,
  Flex,
  Button,
  SimpleGrid,
  Icon,
  Text,
  Link,
} from "@chakra-ui/react";
import { FaInstagram } from "react-icons/fa";
import {
  IoLogInOutline,
  IoShieldCheckmarkOutline,
  IoSwapHorizontal,
} from "react-icons/io5";
import { motion } from "framer-motion";

const VintageLandingPage: FC = () => {
  const MotionBox = motion.create(Box);

  const renderTextView = useCallback((text: string) => {
    return (
      <Box textAlign={"center"} my={2} fontWeight={"bold"} fontSize={"md"}>
        {text}
      </Box>
    );
  }, []);

  return (
    <>
      <Box bg="white" minH="100vh" display="flex" flexDirection="column">
        {/* Hero Section */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Box
            bgImage="linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('https://cdn.usegalileo.ai/sdxl10/e3fe2854-4f36-4375-893a-e081d9b8899a.png')"
            bgSize="cover"
            bgPosition="center"
            py={20}
            px={4}
            textAlign="center"
            color="white"
          >
            <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black">
              僕らのヴィンテージ
            </Heading>
            <Text mt={2} fontSize={"md"}>
              2025年秋ローンチ予定。
              <br />
              ヴィンテージをもっと楽しく, もっと自由に。
            </Text>
            <Flex mt={6} justify="center" gap={4} flexWrap="wrap">
              <Button colorScheme="green" borderRadius="full">
                ローンチをいち早くお知らせ
              </Button>
              <Button bg="#F4EFE6" color="#1C160C" borderRadius="full">
                僕らのヴィンテージを応援
              </Button>
            </Flex>
          </Box>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }} // 遅延で順に出現
          px={4}
          py={6}
          textAlign="center"
          color="#1C160C"
          fontSize={{ base: "sm", md: "md" }}
          maxW="600px"
          mx="auto"
          lineHeight="2"
        >
          {renderTextView("古着ってこんなに高かったっけ？新品はない。")}
          {renderTextView("あの空気感に憧れて町の古着屋をまわったあの頃。")}
          {renderTextView("今はあなたの古着も誰かのもとでもう一度輝ける。")}
          {renderTextView("スーパーなヴィンテージじゃないし、")}
          {renderTextView("買い取りに出しても二束三文。")}
          {renderTextView("それなら、")}
          {renderTextView("古着をみんなで着まわす方が絶対楽しい。")}
        </MotionBox>

        <MotionBox
          bg={"#edeef4"}
          py={4}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} px={4}>
            <FeatureCard
              icon={IoLogInOutline}
              title="古着登録"
              desc="簡単に登録"
            />
            <FeatureCard
              icon={IoShieldCheckmarkOutline}
              title="欲しい古着とマッチング"
              desc="好みの古着を探す"
            />
            <FeatureCard
              icon={IoSwapHorizontal}
              title="発送・受け取り"
              desc="3ステップで交換"
            />
          </SimpleGrid>
        </MotionBox>

        <Text
          px={4}
          pt={6}
          pb={3}
          textAlign="center"
          fontSize="md"
          color="#A18249"
        >
          あなたも古着を着まわす“仲間”になりませんか？
        </Text>

        <Box textAlign="center" py={8}>
          <Flex justify="center" mb={4}>
            <Link href="https://chakra-ui.com" isExternal color="#A18249">
              <Icon as={FaInstagram} boxSize={6} />
            </Link>
          </Flex>
          <Text fontSize="md" color="#A18249">
            © 2025 僕らのヴィンテージ
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default VintageLandingPage;
