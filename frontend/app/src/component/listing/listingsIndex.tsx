import React, { FC, useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import RenderTabPanel from "./renderPanel";
import useListing from "../../hooks/useUsers";
import SearchForm from "../common/form/searchForm";
import { useLocation } from "react-router-dom";

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

  return (
    <>
      <SearchForm
        hidden={!userSearchHidden}
        tagList={memorizeTagList}
        selectedTag={memorizeSelectedTag}
        route={pathname}
      />
      <Tabs mt={10} colorScheme="teal" bgColor={"white"}>
        <TabList>
          <Tab width={"50%"} onClick={() => setUserSearchHidden(true)}>
            ユーザー
          </Tab>
          <Tab width={"50%"} onClick={() => setUserSearchHidden(false)}>
            フォロー
          </Tab>
          <Tab width={"50%"} onClick={() => setUserSearchHidden(false)}>
            フォロワー
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {memorizeUserList.length === 0 && (
              <Text px={4}>ユーザーがいません。</Text>
            )}
            <RenderTabPanel data={memorizeUserList} />
          </TabPanel>
          <TabPanel>
            <RenderTabPanel data={memorizeFollowLists} />
          </TabPanel>
          <TabPanel>
            <RenderTabPanel data={memorizeFollowersLists} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
});

export default ListingsIndex;
