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
} from "@chakra-ui/react";
import { FaExclamation } from "react-icons/fa";

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
      navigate(`${route.shopPage}?userItem=${user_id}`);
    },
    [navigate, readUserTimestamps]
  );

  return (
    <>
      <TabPanel p={0}>
        <VStack align={"start"}>
          {data.map((list, index) => {
            const userKey: string = list.user_id.toString();
            const lastRead = readUserTimestamps[userKey];
            console.log(list.uploaded_at, lastRead);
            const isNew =
              !lastRead || new Date(list.uploaded_at) > new Date(lastRead);
            return (
              <HStack
                key={index}
                onClick={() =>
                  userPageTransition(list.user_id, list.uploaded_at)
                }
                _hover={{
                  bgColor: "#f4f2f0",
                  transition: "background-color 0.3s ease",
                }}
                w={"full"}
              >
                <Box position={"relative"}>
                  <Avatar
                    src={
                      list.image_url.length > 0
                        ? list.image_url
                        : "https://bit.ly/broken-link"
                    }
                  />
                  {isNew && (
                    <Box
                      position={"absolute"}
                      top={-3}
                      right={-3}
                      borderRadius={"50%"}
                      bgColor={"#b03a3a"}
                      p={1}
                    >
                      <FaExclamation size={10} color="white" />
                    </Box>
                  )}
                </Box>

                <VStack align={"start"} ml={4}>
                  <Text>{list.name}</Text>
                  <HStack align={"start"}>
                    <Tag size={"md"} variant="solid">
                      所在地 :{list.location}
                    </Tag>
                    <Tag size={"md"} variant="solid">
                      古着歴 :{list.age}年
                    </Tag>
                  </HStack>
                  <Wrap>
                    {list.tags?.map((tag) => {
                      return (
                        <Tag
                          size={"md"}
                          variant="solid"
                          key={tag.key}
                          colorScheme="teal"
                        >
                          {tag.name}
                        </Tag>
                      );
                    })}
                  </Wrap>

                  <Text size={"sm"} color={"#887563"}>
                    商品数 : {list.item_count}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
        </VStack>
      </TabPanel>
    </>
  );
};

export default RenderPanel;
