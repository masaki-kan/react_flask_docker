import { FC, useRef, useEffect } from "react";
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
} from "@chakra-ui/react";
import KeyboardControlGallerySlider from "../common/slider/keyboardControlGallerySlider";
import useChat from "../../hooks/useChat";
import { itemTypeViewHanlder } from "../common/type/itemTypeView";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ChatLeft: FC = () => {
  const { memorizeChatItemData, upDateChatHight } = useChat();
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

  const ItemViewCard: FC = () => (
    <Card mx="auto" borderWidth={1} borderColor="#edf2f7" ref={cardRef}>
      <CardBody>
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
            <Stack divider={<StackDivider />} spacing="2">
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
                  価格
                </Heading>
                <Text pt="2" fontSize="sm" color="gray.500">
                  {memorizeChatItemData.curr}
                  {memorizeChatItemData.price}
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
