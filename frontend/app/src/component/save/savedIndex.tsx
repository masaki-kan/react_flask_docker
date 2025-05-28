import { FC, useCallback } from "react";
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
  Tag,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import useSaved from "../../hooks/useSaved";
import { useNavigate } from "react-router-dom";
import { viewDate } from "../common/date/format";
import { statusView } from "../common/saved/saveStatusView.ts";
import useMyProfile from "../../hooks/useProfile.ts";

const SavedIndex: FC = () => {
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const { memorizeSavedList } = useSaved();

  const transactionChat = useCallback(
    (tradeId: number) => {
      navigate(
        `${route.transactionChat}?item_id=${tradeId}&user_id=${memorizeProfile.profile.id}`
      );
    },
    [memorizeProfile.profile.id, navigate]
  );

  return (
    <>
      <Tabs mt={10} colorScheme="teal" bg={"white"}>
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
                  onClick={() => transactionChat(save.trade_id)}
                  _hover={{
                    bgColor: "#f4f2f0",
                    transition: "background-color 0.3s ease",
                  }}
                  justifyContent={"space-between"}
                  cursor={"pointer"}
                  w={"full"}
                  px={2}
                  py={2}
                  borderBottom={"1px solid #887563"}
                >
                  <HStack justifyContent={"space-between"}>
                    <Image
                      src={save.image_url}
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
                        {save.title}
                      </Text>
                      <Text size={"sm"} color={"#887563"}>
                        {viewDate(save.trade_created_at)}
                      </Text>
                      <Tag size={"sm"} color={"#887563"}>
                        {statusView(save.status)}
                      </Tag>
                      <HStack
                        align={"center"}
                        display={{ base: "flex", md: "none" }}
                      >
                        <Avatar src={save.user_image_url} size={"sm"} />
                        <Text size={"sm"} color={"#887563"}>
                          {save.user_name}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <VStack
                    align={"center"}
                    display={{ base: "none", md: "flex" }}
                  >
                    <Avatar src={save.user_image_url} />
                    <Text size={"sm"} color={"#887563"}>
                      {save.user_name}
                    </Text>
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
