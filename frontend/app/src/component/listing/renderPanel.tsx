import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { renderTabPanelType } from "../../types/listTye";
import { route } from "../../route/routeConst";
import {
  TabPanel,
  VStack,
  HStack,
  Avatar,
  Text,
  Tag,
  Wrap,
} from "@chakra-ui/react";

const RenderPanel: FC<renderTabPanelType> = ({ data }) => {
  const navigate = useNavigate();
  const userPageTransition = useCallback(
    (user_id: number) => {
      navigate(`${route.shopPage}?userItem=${user_id}`);
    },
    [navigate]
  );

  return (
    <>
      <TabPanel p={0}>
        <VStack align={"start"}>
          {data.map((list, index) => {
            return (
              <HStack
                key={index}
                onClick={() => userPageTransition(list.user_id)}
                _hover={{
                  bgColor: "#f4f2f0",
                  transition: "background-color 0.3s ease",
                }}
                w={"full"}
              >
                <Avatar
                  src={
                    list.image_url.length > 0
                      ? list.image_url
                      : "https://bit.ly/broken-link"
                  }
                />
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
