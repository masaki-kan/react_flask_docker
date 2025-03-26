import { FC, useCallback, useEffect } from "react";
import {
  Avatar,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  Text,
  Image,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import useSaved from "../../hooks/useSaved";
import { useNavigate } from "react-router-dom";

const SavedIndex: FC = () => {
  const navigate = useNavigate();
  const { getSavedListHandler, memorizeSavedList } = useSaved();

  useEffect(() => {
    getSavedListHandler();
  }, [getSavedListHandler]);

  const transactionChat = useCallback(
    (index: number) => {
      navigate(
        `${route.transactionChat}?item_id=${index}?user_id=${index + 1}`
      );
    },
    [navigate]
  );

  return (
    <>
      <Tabs mt={10} colorScheme="teal">
        <TabList>
          <Tab width={"50%"}>取引中</Tab>
          <Tab width={"50%"}>取引終了</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {memorizeSavedList.map((save, index) => {
              return (
                <HStack
                  key={index}
                  onClick={() => transactionChat(index)}
                  _hover={{
                    bgColor: "#f4f2f0",
                    transition: "background-color 0.3s ease",
                  }}
                  justifyContent={"space-between"}
                  cursor={"pointer"}
                  w={"full"}
                  px={2}
                  py={2}
                >
                  <HStack justifyContent={"space-between"}>
                    <Image
                      src={save.item.image}
                      alt={""}
                      w={20}
                      h="auto"
                      bgPosition="center"
                      bgRepeat="no-repeat"
                      bgSize="cover"
                      borderRadius="md"
                    />
                    <VStack align={"start"} ml={2}>
                      <Text size={"sm"} color={"#887563"}>
                        {save.item.name}
                      </Text>
                      <Text size={"sm"} color={"#887563"}>
                        {save.savedtime}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align={"center"}>
                    <Avatar src={save.user.image} />
                  </VStack>
                </HStack>
              );
            })}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default SavedIndex;
