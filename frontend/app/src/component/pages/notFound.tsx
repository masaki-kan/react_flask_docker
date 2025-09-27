import { FC, useCallback } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";
import { route } from "../../route/routeConst";
import { useAppColors } from "../../utils/theme/colorModeUtils";

const NotFound: FC = () => {
  const navigate = useNavigate();
  const { pageBg, cardBg, borderColor, textColor, headingColor } =
    useAppColors();

  const gradientBg = useColorModeValue(
    "linear(to-br, orange.50, red.50)",
    "linear(to-br, orange.900, red.900)"
  );

  const handleGoHome = useCallback(() => {
    navigate(route.login);
  }, [navigate]);

  // const handleGoBack = useCallback(() => {
  //   window.history.back();
  // }, []);

  return (
    <Box bg={pageBg} minH="100vh" display="flex" alignItems="center">
      <Container maxW="container.md" py={20}>
        <VStack spacing={8} textAlign="center">
          {/* 404アイコンとテキスト */}
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={10}
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
            bgGradient={gradientBg}
            position="relative"
            overflow="hidden"
          >
            {/* 背景装飾 */}
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              w="150px"
              h="150px"
              borderRadius="full"
              bg="white"
              opacity={0.1}
            />
            <Box
              position="absolute"
              bottom="-30px"
              left="-30px"
              w="100px"
              h="100px"
              borderRadius="full"
              bg="white"
              opacity={0.1}
            />

            <VStack spacing={6} position="relative">
              <Icon
                as={FaExclamationTriangle}
                boxSize={20}
                color="orange.500"
                filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
              />
              <VStack spacing={2}>
                <Heading
                  size="4xl"
                  color={headingColor}
                  fontWeight="black"
                  letterSpacing="-0.02em"
                >
                  404
                </Heading>
                <Heading size="lg" color={headingColor} fontWeight="semibold">
                  ページが見つかりません
                </Heading>
              </VStack>
            </VStack>
          </Box>

          {/* 説明テキスト */}
          <VStack spacing={4} maxW="md">
            <Text fontSize="lg" color={textColor} lineHeight="tall">
              お探しのページは削除されたか、
              <br />
              URLが変更された可能性があります。
            </Text>
            <Text fontSize="md" color="gray.500">
              以下のボタンからサイトをご利用ください。
            </Text>
          </VStack>

          {/* アクションボタン */}
          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button
              leftIcon={<FaHome />}
              colorScheme="orange"
              size="lg"
              onClick={handleGoHome}
              boxShadow="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            >
              ログインページへ
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFound;
