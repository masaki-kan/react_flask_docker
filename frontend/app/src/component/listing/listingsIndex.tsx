import { FC, useState, useEffect } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Avatar,
  VStack,
  Text,
} from "@chakra-ui/react";
import { followListType, renderTabPanelType } from "../../types/listTye";

const RenderTabPanel: FC<renderTabPanelType> = ({ data }) => {
  return (
    <>
      <TabPanel>
        <VStack align={"start"} gap={4}>
          {data.map((list, index) => {
            return (
              <>
                <HStack key={index}>
                  <Avatar src={list.icon} />
                  <VStack align={"start"} ml={4}>
                    <Text>{list.name}</Text>
                    <Text size={"sm"} color={"#887563"}>
                      商品数:{list.itemNumber}
                    </Text>
                  </VStack>
                </HStack>
              </>
            );
          })}
        </VStack>
      </TabPanel>
    </>
  );
};

const ListingsIndex: FC = () => {
  const [followLists, setFollowList] = useState<followListType[]>([]);
  const [followersList, setFollowersList] = useState<followListType[]>([]);

  useEffect(() => {
    const folletListData = [
      {
        id: 1,
        name: "名前 1",
        itemNumber: 10,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
      {
        id: 2,
        name: "名前 2",
        itemNumber: 20,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
    ];

    const folleertListData = [
      {
        id: 3,
        name: "名前 3",
        itemNumber: 30,
        icon: "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      },
    ];

    setFollowList(folletListData);
    setFollowersList(folleertListData);
  }, []);

  return (
    <>
      <Tabs mt={10}>
        <TabList>
          <Tab>フォロー</Tab>
          <Tab>フォロワー</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <RenderTabPanel data={followLists} />
          </TabPanel>
          <TabPanel>
            <RenderTabPanel data={followersList} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default ListingsIndex;
