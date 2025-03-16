import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { renderTabPanelType } from "../../types/listTye";
import { route } from "../../route/routeConst";
import { TabPanel, VStack, HStack, Avatar, Text } from "@chakra-ui/react";

const RenderPanel: FC<renderTabPanelType> = ({ data }) => {
  const navigate = useNavigate();
  const userPageTransition = () => {
    navigate(route.shopPage);
  };

  return (
    <>
      <TabPanel>
        <VStack align={"start"}>
          {data.map((list, index) => {
            return (
              <HStack
                key={index}
                onClick={userPageTransition}
                _hover={{
                  bgColor: "#f4f2f0",
                  transition: "background-color 0.3s ease",
                }}
                w={"full"}
                px={2}
                py={2}
              >
                <Avatar src={list.icon} />
                <VStack align={"start"} ml={4}>
                  <Text>{list.name}</Text>
                  <Text size={"sm"} color={"#887563"}>
                    商品数:{list.itemNumber}
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
