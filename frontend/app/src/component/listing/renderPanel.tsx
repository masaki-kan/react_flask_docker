import { FC, useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { renderTabPanelType } from "../../types/listType";
import { route } from "../../route/routeConst";
import {
  TabPanel,
  VStack,
  HStack,
  Avatar,
  Text,
  Tag,
  Wrap,
  Box,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";

const RenderPanel: FC<renderTabPanelType> = ({ data }) => {
  const [readUserTimestamps, setReadUserTimestamps] = useState<
    Record<string, string>
  >(() => {
    const stored = localStorage.getItem("readUserTimestamps");
    try {
      return stored ? JSON.parse(stored) : {};
    } catch {
      localStorage.removeItem("readUserTimestamps");
      return {};
    }
  });
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    localStorage.setItem(
      "readUserTimestamps",
      JSON.stringify(readUserTimestamps)
    );
  }, [readUserTimestamps]);

  const userPageTransition = useCallback(
    (user_id: number, uploadedAt: string) => {
      const newTimestamps = {
        ...readUserTimestamps,
        [user_id]: uploadedAt,
      };
      setReadUserTimestamps(newTimestamps);
      // ここで保存しても良い
      localStorage.setItem("readUserTimestamps", JSON.stringify(newTimestamps));
      navigate(`${route.shopPage}?user=${user_id}`);
    },
    [navigate, readUserTimestamps]
  );

  return (
    <>
      <TabPanel p={0} overflowY={"auto"} height={"500px"}>
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)", // モバイル: 2列
            sm: "repeat(3, 1fr)", // 小さいスクリーン: 2列
            md: "repeat(3, 1fr)", // タブレット: 3列
            lg: "repeat(4, 1fr)", // デスクトップ: 4列
            xl: "repeat(5, 1fr)", // 大画面: 5列
          }}
          gap={{ base: 3, md: 4, lg: 6 }}
        >
          {data.map((list, index) => {
            const userKey: string = list.user_id.toString();
            const lastRead = readUserTimestamps[userKey];
            const isNew =
              !lastRead || new Date(list.uploaded_at) > new Date(lastRead);

            return (
              <GridItem
                key={index}
                w="100%"
                cursor="pointer"
                onClick={() =>
                  userPageTransition(list.user_id, list.uploaded_at)
                }
                borderRadius="lg"
                overflow="hidden"
                bg="white"
                boxShadow="sm"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "lg",
                  bgColor: "#f4f2f0",
                }}
              >
                <VStack align="stretch" spacing={2} p={{ base: 3, md: 4 }}>
                  {/* アバターセクション */}
                  <HStack justify="center">
                    <Box position="relative">
                      {list.image_url.length > 0 ? (
                        <Avatar
                          size={"xl"}
                          name={"my name"}
                          src={list.image_url}
                        />
                      ) : (
                        <Box ml={4} mx={"auto"}>
                          <FaUserCircle size={"96px"} color="gray.500" />
                        </Box>
                      )}

                      {isNew && (
                        <Box
                          position="absolute"
                          top={0}
                          right={0}
                          borderRadius="50%"
                          bgColor="#b03a3a"
                          p={{ base: 1, md: 1.5 }}
                        ></Box>
                      )}
                    </Box>
                  </HStack>

                  {/* ユーザー名 */}
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "md" }}
                    textAlign="center"
                    noOfLines={1}
                  >
                    {list.name}
                  </Text>

                  {/* 基本情報タグ */}
                  <VStack spacing={1} align="stretch">
                    <HStack justify="center" flexWrap="wrap" spacing={1}>
                      <Tag
                        size={{ base: "sm", md: "md" }}
                        variant="solid"
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        所在地: {list.location}
                      </Tag>
                      <Tag
                        size={{ base: "sm", md: "md" }}
                        variant="solid"
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        古着歴: {list.age}年
                      </Tag>
                    </HStack>
                    {/* タグリスト */}
                    <Wrap justify="center" spacing={1}>
                      {list.tags?.slice(0, 3).map((tag) => (
                        <Tag
                          size={{ base: "sm", md: "md" }}
                          variant="solid"
                          key={tag.key}
                          colorScheme="teal"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          {tag.name}
                        </Tag>
                      ))}
                      {list.tags?.length > 3 && (
                        <Tag
                          size={{ base: "sm", md: "md" }}
                          variant="solid"
                          colorScheme="teal"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          +{list.tags.length - 3}
                        </Tag>
                      )}
                    </Wrap>

                    {/* 商品数 */}
                    <Text
                      fontSize={{ base: "xs", md: "sm" }}
                      color="#887563"
                      textAlign="center"
                    >
                      商品数: {list.item_count}
                    </Text>
                  </VStack>
                </VStack>
              </GridItem>
            );
          })}
        </Grid>
      </TabPanel>
    </>
  );
};

export default RenderPanel;
