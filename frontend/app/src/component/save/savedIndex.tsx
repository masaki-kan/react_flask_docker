import { FC, useMemo } from "react";
import {
  Box,
  // Container,
  // VStack,
  // HStack,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaHandshake } from "react-icons/fa";
import useSaved from "../../hooks/useSaved";
import { TRADE_STATUS } from "../../constants/tradeStatus";
import RenderSaved from "./renderSaved";
import { useEffectOnce } from "react-use";

const SavedIndex: FC = () => {
  const { savedList, getSavedListHandler } = useSaved();
  const MotionBox = motion.create(Box);
  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const unCompletedList = useMemo(() => {
    return savedList
      .filter((list) => list.status !== TRADE_STATUS.COMPLETED)
      .map((list) => {
        return list;
      });
  }, [savedList]);

  const tabs = [
    {
      label: "取引中",
      icon: FaHandshake,
      count: unCompletedList.length,
      data: unCompletedList,
    },
  ];

  useEffectOnce(() => {
    getSavedListHandler();
  });

  return (
    <>
      <Box pb={24} pt={4}>
        <AnimatePresence mode="wait">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            w="full"
          >
            {tabs.map((tab, index) => {
              if (tab.data.length === 0) {
                return (
                  <Box
                    key={index}
                    textAlign="center"
                    py={20}
                    bg={bgColor}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <Icon as={tab.icon} boxSize={12} color="gray.300" mb={4} />
                    <Text color="gray.500" fontSize="lg">
                      {index === 0
                        ? "現在進行中の取引はありません"
                        : "完了した取引はありません"}
                    </Text>
                  </Box>
                );
              } else {
                return <RenderSaved key={index} savedList={tab.data} />;
              }
            })}
          </MotionBox>
        </AnimatePresence>
      </Box>
    </>
  );
};

export default SavedIndex;

// 代替デザイン: ピルスタイル
/*
<HStack
  bg={bgColor}
  p={2}
  borderRadius="full"
  boxShadow="sm"
  border="1px solid"
  borderColor={borderColor}
  w="fit-content"
  mx="auto"
>
  {tabs.map((tab, index) => (
    <Tab
      key={index}
      px={6}
      py={3}
      borderRadius="full"
      _selected={{
        bg: activeColor,
        color: "white",
        boxShadow: "md",
      }}
      _hover={{
        bg: hoverBg,
      }}
      transition="all 0.2s"
      color={textColor}
    >
      <HStack spacing={2}>
        <Icon as={tab.icon} boxSize={4} />
        <Text fontSize="sm" fontWeight="medium">{tab.label}</Text>
        <Badge
          size="sm"
          colorScheme={index === 0 ? "orange" : "green"}
          borderRadius="full"
        >
          {tab.count}
        </Badge>
      </HStack>
    </Tab>
  ))}
</HStack>
*/

// 代替デザイン: カード切り替えスタイル
/*
<Grid templateColumns="repeat(2, 1fr)" gap={4} mb={6}>
  {tabs.map((tab, index) => (
    <GridItem key={index}>
      <Box
        as="button"
        onClick={() => setSelectedTab(index)}
        w="full"
        p={6}
        bg={selectedTab === index ? activeColor : bgColor}
        color={selectedTab === index ? "white" : textColor}
        borderRadius="xl"
        border="2px solid"
        borderColor={selectedTab === index ? activeColor : borderColor}
        boxShadow={selectedTab === index ? "lg" : "sm"}
        transition="all 0.2s"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "lg",
        }}
      >
        <VStack spacing={3}>
          <Icon as={tab.icon} boxSize={8} />
          <Text fontWeight="bold" fontSize="lg">{tab.label}</Text>
          <Badge
            colorScheme={selectedTab === index ? "whiteAlpha" : "gray"}
            fontSize="md"
            px={3}
            py={1}
          >
            {tab.count}件
          </Badge>
        </VStack>
      </Box>
    </GridItem>
  ))}
</Grid>
*/
