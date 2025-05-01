import { Spinner, Flex } from "@chakra-ui/react";

const FullScreenSpinner = () => {
  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="rgba(255, 255, 255, 0.7)" // 半透明背景
      justify="center"
      align="center"
      zIndex="9999"
    >
      <Spinner size="xl" color="teal.500" thickness="4px" speed="0.65s" />
    </Flex>
  );
};

export default FullScreenSpinner;
