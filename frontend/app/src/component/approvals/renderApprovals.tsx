import {
  HStack,
  TabPanel,
  VStack,
  Image,
  Text,
  Button,
} from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import { viewDate } from "../common/date/format";
import { tradeApprovalListType } from "../../types/approvalType";
import useApprovals from "../../hooks/useApprovals";

type RenderApprovalsType = {
  approvalsList: tradeApprovalListType[];
};

const RenderApprovals: FC<RenderApprovalsType> = ({ approvalsList }) => {
  const navigate = useNavigate();
  const { tradeApprovalRespond } = useApprovals();
  const shopPageHanlder = useCallback(
    (targetUserId: number) => {
      navigate(`${route.shopPage}?userItem=${targetUserId}`);
      return;
    },
    [navigate]
  );

  const tradeApprovalRespondHandler = useCallback(
    (approval_id: number, status: number) => {
      tradeApprovalRespond(approval_id, status);
    },
    [tradeApprovalRespond]
  );

  return (
    <>
      <TabPanel p={0}>
        <VStack align={"start"}>
          {approvalsList.map((list, index) => {
            return (
              <HStack
                key={index}
                alignItems={"start"}
                onClick={() => {}}
                _hover={{
                  bgColor: "#f4f2f0",
                  transition: "background-color 0.3s ease",
                }}
                borderBottom={"1px solid #887563"}
                pb={2}
                w={"full"}
              >
                <Image
                  cursor={"pointer"}
                  src={list.item.image}
                  w={{ base: "30%", md: "40%" }}
                  height={{ base: "80px", md: "150px" }}
                  objectFit={"contain"}
                  bgPosition="center"
                  bgRepeat="no-repeat"
                  bgColor={"white"}
                  bgSize="cover"
                  onClick={() => shopPageHanlder(list.target_user.id)}
                />
                <VStack align={"start"} w={"full"}>
                  <Text color="#887563" fontSize={{ base: "xs", md: "md" }}>
                    {list.item.title}
                  </Text>
                  <Text color="#887563" fontSize={{ base: "xs", md: "md" }}>
                    {viewDate(
                      new Date(
                        new Date(list.created_at).getTime() + 9 * 60 * 60 * 1000
                      )
                    )}
                  </Text>
                  {/* <Text color="#887563" fontSize={{ base: "xs", md: "md" }}>
                    更新{list.time_ago}
                  </Text> */}
                  {list.type === "received" ? (
                    <>
                      <Text color="#887563" fontSize={"xs"}>
                        申請者 : {list.target_user.name}
                      </Text>
                      <Text color="#887563" fontSize={"xs"}>
                        ステータス : {list.status_text}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text color="#887563" fontSize={"xs"}>
                        出品者 : {list.target_user.name}
                      </Text>
                      <Text color="#887563" fontSize={"xs"}>
                        ステータス : {list.status_text}
                      </Text>
                    </>
                  )}
                </VStack>
                <VStack
                  align={"start"}
                  justifyContent={"space-between"}
                  mt={1}
                  hidden={list.type !== "received" || list.status === 2}
                >
                  <Button
                    size={"xs"}
                    colorScheme="gray"
                    onClick={() =>
                      tradeApprovalRespondHandler(list.approval_id, 1)
                    }
                  >
                    承認
                  </Button>
                  <Button
                    size={"xs"}
                    colorScheme="red"
                    onClick={() =>
                      tradeApprovalRespondHandler(list.approval_id, 2)
                    }
                  >
                    却下
                  </Button>
                </VStack>
              </HStack>
            );
          })}
        </VStack>
      </TabPanel>
    </>
  );
};

export default RenderApprovals;
