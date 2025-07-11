import React, { FC, useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  VStack,
  Text,
  Container,
  useColorModeValue,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import RenderTabPanel from "./renderPanel";
import useListing from "../../hooks/useUsers";
import SearchForm from "../form/searchForm";
import { useLocation } from "react-router-dom";
import { FaUsers, FaUserFriends, FaHeart } from "react-icons/fa";

const ListingsIndex: FC = React.memo(() => {
  const pathname = useLocation().pathname;
  const {
    memorizeFollowLists,
    memorizeFollowersLists,
    memorizeUserList,
    memorizeTagList,
    memorizeSelectedTag,
  } = useListing();

  const [userSearchHidden, setUserSearchHidden] = useState<boolean>(true);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const tabs = [
    {
      label: "ユーザー",
      icon: FaUsers,
      count: memorizeUserList.length,
      showSearch: true,
    },
    {
      label: "フォロー",
      icon: FaUserFriends,
      count: memorizeFollowLists.length,
      showSearch: false,
    },
    {
      label: "フォロワー",
      icon: FaHeart,
      count: memorizeFollowersLists.length,
      showSearch: false,
    },
  ];

  const MotionBox = motion(Box);

  return (
    <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
      <VStack spacing={6} align="stretch">
        {/* スタイリッシュなタブ */}
        <Tabs
          variant="unstyled"
          onChange={(index) => setUserSearchHidden(tabs[index].showSearch)}
        >
          <Box
            bg={bgColor}
            p={1}
            borderRadius="xl"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor={borderColor}
          >
            <TabList>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  flex={1}
                  mx={0.5}
                  borderRadius="lg"
                  _selected={{
                    bg: activeColor,
                    color: "white",
                  }}
                  transition="all 0.2s"
                  color={textColor}
                >
                  <VStack spacing={1}>
                    <Icon as={tab.icon} boxSize={5} />
                    <Text fontWeight="sx">{tab.label}</Text>
                    <Badge
                      colorScheme="gray"
                      variant="subtle"
                      fontSize="xs"
                      px={2}
                      borderRadius="full"
                    >
                      {tab.count}
                    </Badge>
                  </VStack>
                </Tab>
              ))}
            </TabList>
          </Box>

          {/* 検索フォーム */}
          <AnimatePresence mode="wait">
            {userSearchHidden && (
              <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SearchForm
                  hidden={false}
                  tagList={memorizeTagList}
                  selectedTag={memorizeSelectedTag}
                  route={pathname}
                />
              </MotionBox>
            )}
          </AnimatePresence>

          <TabPanels>
            <TabPanel p={0} mb={10}>
              <AnimatePresence mode="wait">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {memorizeUserList.length === 0 ? (
                    <Box
                      textAlign="center"
                      py={20}
                      bg={bgColor}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Text color="gray.500">ユーザーが見つかりません</Text>
                    </Box>
                  ) : (
                    <RenderTabPanel data={memorizeUserList} />
                  )}
                </MotionBox>
              </AnimatePresence>
            </TabPanel>

            <TabPanel px={0}>
              <AnimatePresence mode="wait">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <RenderTabPanel data={memorizeFollowLists} />
                </MotionBox>
              </AnimatePresence>
            </TabPanel>

            <TabPanel px={0}>
              <AnimatePresence mode="wait">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <RenderTabPanel data={memorizeFollowersLists} />
                </MotionBox>
              </AnimatePresence>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
});

export default ListingsIndex;
