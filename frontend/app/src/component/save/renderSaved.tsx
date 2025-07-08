import { FC, useState, useCallback } from "react";
import { savedListType } from "../../types/savedType";
import {
  HStack,
  VStack,
  Avatar,
  Image,
  Text,
  Box,
  Flex,
} from "@chakra-ui/react";
import { viewDate } from "../common/date/format";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import { FaExclamation } from "react-icons/fa";

type RenderSavedType = {
  savedList: savedListType[];
};

const RenderSaved: FC<RenderSavedType> = ({ savedList }) => {
  const { memorizeProfile } = useMyProfile();
  const navigate = useNavigate();
  const [readSaveTimestamps, setSaveTimestamps] = useState<
    Record<string, string>
  >(() => {
    const stored = localStorage.getItem("readSaveTimestamps");
    try {
      return stored ? JSON.parse(stored) : {};
    } catch {
      localStorage.removeItem("readSaveTimestamps");
      return {};
    }
  });

  const transactionChat = useCallback(
    (tradeId: number) => {
      navigate(
        `${route.transactionChat}?item_id=${tradeId}&user_id=${memorizeProfile.profile.id}`
      );
    },
    [memorizeProfile.profile.id, navigate]
  );

  const saveTransition = useCallback(
    (tradeId: number, createdAt: string) => {
      const newTimestamps = {
        ...readSaveTimestamps,
        [tradeId]: createdAt === null ? new Date() : createdAt,
      };
      setSaveTimestamps(newTimestamps);
      // ここで保存しても良い
      localStorage.setItem("readSaveTimestamps", JSON.stringify(newTimestamps));
      transactionChat(tradeId);
    },
    [readSaveTimestamps, transactionChat]
  );

  return (
    <Flex direction="column" height="80%">
      <Box flex="1" overflowY="auto" py={2}>
        {savedList.map((save, index) => {
          let isNew: boolean = false;
          if (save.status !== "completed") {
            const tradeKey: string = save.trade_id.toString();
            const stored = localStorage.getItem("readSaveTimestamps");
            if (stored !== null) {
              const parseStored = JSON.parse(stored);
              const lastRead = parseStored[tradeKey];
              isNew =
                !lastRead ||
                new Date(save.last_message_time) > new Date(lastRead);
            }
          }

          return (
            <HStack
              key={index}
              onClick={() => {
                if (save.status !== "completed") {
                  saveTransition(save.trade_id, save.last_message_time);
                }
              }}
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
              position={"relative"}
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
                {isNew && (
                  <Box
                    position={"absolute"}
                    top={1}
                    right={0}
                    borderRadius={"50%"}
                    bgColor={"#b03a3a"}
                    p={1}
                  >
                    <FaExclamation size={10} color="white" />
                  </Box>
                )}
                <VStack align={"start"} ml={2}>
                  <Text size={"sm"} color={"#887563"}>
                    {save.title}
                  </Text>
                  <Text size={"sm"} color={"#887563"}>
                    {viewDate(save.trade_created_at)}
                  </Text>
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
              <VStack align={"center"} display={{ base: "none", md: "flex" }}>
                <Avatar src={save.user_image_url} />
                <Text size={"sm"} color={"#887563"}>
                  {save.user_name}
                </Text>
              </VStack>
            </HStack>
          );
        })}
      </Box>
    </Flex>
  );
};

export default RenderSaved;
