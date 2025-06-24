import { FC, useMemo } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import useSaved from "../../hooks/useSaved";
import RenderSaved from "./renderSaved";

const SavedIndex: FC = () => {
  const { savedList } = useSaved();

  const unCompletedList = useMemo(() => {
    return savedList
      .filter((list) => list.status !== "completed")
      .map((list) => {
        return list;
      });
  }, [savedList]);

  const completedList = useMemo(() => {
    return savedList
      .filter((list) => list.status === "completed")
      .map((list) => {
        return list;
      });
  }, [savedList]);

  return (
    <>
      <Tabs mt={10} colorScheme="teal" bg={"white"}>
        <TabList>
          <Tab width={"50%"}>取引中</Tab>
          <Tab width={"50%"}>取引終了</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <RenderSaved savedList={unCompletedList} />
          </TabPanel>
          <TabPanel>
            <RenderSaved savedList={completedList} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default SavedIndex;
