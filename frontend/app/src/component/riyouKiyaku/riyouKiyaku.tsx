import { FC } from "react";
import { useAppColors } from "../../utils/theme/colorModeUtils";
import { Box, Container, VStack, Heading, Text } from "@chakra-ui/react";

const RiyouKiyaku: FC = () => {
  const { pageBg, textColor, headingColor } = useAppColors();

  const businessInfo = {
    serviceName: "僕らのヴィンテージ",
  };

  return (
    <>
      <Box bg={pageBg} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* ヘッダー */}
            <Box textAlign="center" mb={4}>
              <Heading as="h1" size="lg" mb={3} color={headingColor}>
                利用規約
              </Heading>
              <Text color={textColor} fontSize="md">
                {businessInfo.serviceName} の運営に関する法定表記
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default RiyouKiyaku;
