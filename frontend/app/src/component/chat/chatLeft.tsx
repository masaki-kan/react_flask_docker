import { FC, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Heading,
  HStack,
  Avatar,
  Text,
  useDisclosure,
  IconButton,
  Collapse,
  Button,
} from "@chakra-ui/react";
import KeyboardControlGallerySlider from "../common/slider/keyboardControlGallerySlider";
import useChat from "../../hooks/useChat";
import { itemTypeViewHanlder } from "../common/type/itemTypeView";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import {
  statusView,
  chatDetailTradeStatus,
} from "../common/saved/saveStatusView.ts";
import useMyProfile from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

const ChatLeft: FC = () => {
  const navigate = useNavigate();
  const { memorizeChatItemData, upDateChatHight, tradeStatusChangeHandler } =
    useChat();
  const { memorizeProfile } = useMyProfile();
  const { isOpen, onToggle } = useDisclosure();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardRef.current) {
        upDateChatHight(cardRef.current.offsetHeight);
      }
    }, 100); // 画像の読み込み猶予
    return () => clearTimeout(timer);
  }, [upDateChatHight]);

  const tradesStatusUpdateHandler = useCallback(
    async (status: string) => {
      if (status === "cancelled") {
        const checkFlg = window.confirm("取引を終了してもよろしいですか？");
        if (checkFlg) {
          await tradeStatusChangeHandler(memorizeChatItemData.trade_id, status);
          navigate(route.home);
        }
        return;
      } else {
        await tradeStatusChangeHandler(memorizeChatItemData.trade_id, status);
      }
    },
    [memorizeChatItemData.trade_id, navigate, tradeStatusChangeHandler]
  );

  const renderTradeStatus = useCallback(
    (status: string, sellerId: number) => {
      if (memorizeProfile.profile.id !== String(sellerId)) return <></>;
      const results = chatDetailTradeStatus(status);
      return (
        <>
          {results.map((list, index) => {
            return (
              <Button
                key={index}
                size={"xs"}
                colorScheme={list.color}
                onClick={() => tradesStatusUpdateHandler(list.status)}
              >
                {list.text}
              </Button>
            );
          })}
        </>
      );
    },
    [memorizeProfile.profile.id, tradesStatusUpdateHandler]
  );

  const ItemViewCard: FC = () => (
    <Card mx="auto" borderWidth={1} borderColor="#edf2f7" ref={cardRef}>
      <CardBody>
        <HStack justifyContent={"center"} mb={3}>
          <Text size="xs" fontWeight={"bold"}>
            {statusView(memorizeChatItemData.status)}
          </Text>
        </HStack>

        <Stack spacing="2">
          {/* 常に表示される画像（スマホでも） */}
          <KeyboardControlGallerySlider
            images={memorizeChatItemData.images}
            sm={true}
          />

          {/* スマホ: トグルボタン */}
          <Box display={{ base: "flex", md: "none" }} justifyContent="flex-end">
            <IconButton
              icon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
              aria-label="Toggle item detail"
              size="sm"
              onClick={onToggle}
              variant="ghost"
            />
          </Box>

          {/* 折りたたみ：PCでは常に開く、スマホはトグル */}
          <Collapse in={isOpen || window.innerWidth >= 768} animateOpacity>
            <Stack divider={<StackDivider />} spacing="2" mb={4}>
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  投稿主
                </Heading>
                <HStack alignItems="center">
                  <Avatar
                    size="md"
                    name="my name"
                    src={
                      memorizeChatItemData.profile_image.length > 0
                        ? memorizeChatItemData.profile_image
                        : "https://bit.ly/broken-link"
                    }
                  />
                  <Text pt="2" fontSize="sm" color="gray.500">
                    {memorizeChatItemData.seller_name}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  商品
                </Heading>
                <Text pt="2" fontSize="sm" color="gray.500">
                  {memorizeChatItemData.title}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  タイプ
                </Heading>
                <Text pt="2" fontSize="sm" color="gray.500">
                  {itemTypeViewHanlder(memorizeChatItemData.type)}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  概要
                </Heading>
                <Text pt="2" fontSize="sm" color="gray.500">
                  {memorizeChatItemData.description}
                </Text>
              </Box>
            </Stack>
          </Collapse>
          <HStack
            spacing={3}
            justifyContent={"end"}
            align={"center"}
            width={"100%"}
          >
            <HStack justifyContent={"space-around"}>
              {renderTradeStatus(
                memorizeChatItemData.status,
                memorizeChatItemData.user_id
              )}
            </HStack>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );

  return (
    <>
      <Box w={{ base: "100%", md: "30%" }} mb={4} mr={{ md: 2 }}>
        <ItemViewCard />
      </Box>
    </>
  );
};

export default ChatLeft;
