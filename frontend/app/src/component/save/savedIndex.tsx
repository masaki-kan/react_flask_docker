import { FC, useMemo } from "react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { FaHandshake } from "react-icons/fa";
import useSaved from "../../hooks/useSaved";
import RenderSaved from "./renderSaved";

const SavedIndex: FC = () => {
  const { savedList } = useSaved();

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const unCompletedList = useMemo(() => {
    return savedList
      .filter((list) => list.status !== "completed")
      .map((list) => {
        return list;
      });
  }, [savedList]);

  // const completedList = useMemo(() => {
  //   return savedList
  //     .filter((list) => list.status === "completed")
  //     .map((list) => {
  //       return list;
  //     });
  // }, [savedList]);

  const tabs = [
    {
      label: "取引中",
      icon: FaHandshake,
      count: unCompletedList.length,
      data: unCompletedList,
    },
  ];

  return (
    <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
      <VStack spacing={6} align="stretch">
        {/* スタイリッシュなタブ */}
        <Tabs variant="unstyled" defaultIndex={0}>
          <Box
            bg={bgColor}
            p={1}
            borderRadius="xl"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor={borderColor}
            position={"sticky"}
            top={-1}
            zIndex={100}
          >
            <TabList>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  flex={1}
                  py={4}
                  mx={0.5}
                  borderRadius="lg"
                  _selected={{
                    bg: activeColor,
                    color: "white",
                  }}
                  transition="all 0.2s"
                  color={textColor}
                >
                  <HStack spacing={3}>
                    <Icon as={tab.icon} boxSize={5} />
                    <Text fontWeight="medium">{tab.label}</Text>
                    <Badge
                      colorScheme="gray"
                      variant="subtle"
                      fontSize="xs"
                      px={2}
                      borderRadius="full"
                      minW={6}
                      textAlign="center"
                    >
                      {tab.count}
                    </Badge>
                  </HStack>
                </Tab>
              ))}
            </TabList>
          </Box>

          <TabPanels>
            {tabs.map((tab, index) => (
              <TabPanel key={index} px={0}>
                <AnimatePresence mode="wait">
                  {tab.data.length === 0 ? (
                    <Box
                      textAlign="center"
                      py={20}
                      bg={bgColor}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Icon
                        as={tab.icon}
                        boxSize={12}
                        color="gray.300"
                        mb={4}
                      />
                      <Text color="gray.500" fontSize="lg">
                        {index === 0
                          ? "現在進行中の取引はありません"
                          : "完了した取引はありません"}
                      </Text>
                    </Box>
                  ) : (
                    <RenderSaved savedList={tab.data} />
                  )}
                </AnimatePresence>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
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
