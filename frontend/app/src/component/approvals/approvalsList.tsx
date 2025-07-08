import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { FC } from "react";
import RenderApprovals from "./renderApprovals";
import useApprovals from "../../hooks/useApprovals";

const ApprovalsList: FC = () => {
  const { memorizeApprovalReceivedApprovals, memorizeApprovalSentApprovals } =
    useApprovals();

  return (
    <>
      <Tabs mt={10} colorScheme="teal" bgColor={"white"}>
        <TabList>
          <Tab width={"50%"}>受信した申請</Tab>
          <Tab width={"50%"}>送信した申請</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <RenderApprovals
              approvalsList={memorizeApprovalReceivedApprovals}
            />
          </TabPanel>
          <TabPanel>
            <RenderApprovals approvalsList={memorizeApprovalSentApprovals} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default ApprovalsList;
