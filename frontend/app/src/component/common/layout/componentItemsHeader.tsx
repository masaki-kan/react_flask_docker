import {
  useColorModeValue,
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";
import { FC } from "react";

type MinimalHeaderType = {
  title: string;
  itemCount: number;
};

const ComponentItemsHeader: FC<MinimalHeaderType> = ({ title, itemCount }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const shadowColor = useColorModeValue(
    "0 4px 12px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.3)"
  );

  return (
    <Box
      bg={bgColor}
      p={{ base: 6, md: 8 }}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow={shadowColor}
      mb={6}
      position="relative"
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <VStack align="start" spacing={3}>
          <HStack>
            <Box w={1} h={10} bg="blue.500" borderRadius="full" />
            <Heading size="xl" letterSpacing="tight">
              {title}
            </Heading>
          </HStack>
          <Text color="gray.600" fontSize="md">
            {itemCount > 0
              ? `${itemCount}件の商品が見つかりました`
              : "ぜひ出品してみましょう"}
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Box
            px={4}
            py={2}
            bg="blue.50"
            color="blue.600"
            borderRadius="md"
            fontWeight="medium"
          >
            新着順
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default ComponentItemsHeader;
