import { FC, useState, useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import {
  Button,
  HStack,
  Text,
  Avatar,
  Box,
  Image,
  Card,
  VStack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import useChat from "../../hooks/useChat";
import { useEffectOnce } from "react-use";
import { messagesType } from "../../types/chatType";
import { viewDate } from "../../utils/date/format";
import { getSocket } from "../../utils/socket/getSocket";
import { checkPatter } from "../../utils/varidate/detectProhibitedContent";

const ChatLayout: FC = () => {
  const toast = useToast();
  const [message, setMessage] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { memorizeChatMessages, memorizeChatItemData } = useChat();
  const searchParams = new URLSearchParams(location.search);
  const tradeIdNumber = searchParams.get("item_id");
  const userIdNumber = searchParams.get("user_id");
  const [roomId, setRoomId] = useState<string>("");
  const [messages, setMessages] = useState<messagesType[]>([]);

  // 自動スクロール
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  useEffect(() => {
    // scrollToBottom();
  }, [messages]);

  useEffectOnce(() => {
    if (tradeIdNumber !== null) {
      setRoomId(`room_${tradeIdNumber}`);
    }
  });

  useEffect(() => {
    setMessages(memorizeChatMessages);
  }, [memorizeChatMessages]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (socket?.connected) {
      // console.log("✅ Already connected to Socket.IO server");
    } else {
      socket?.on("connect", () => {
        // console.log("✅ Connected to Socket.IO server");
      });
    }

    socket?.emit("join", { room: roomId });

    const handleReceiveMessage = (data: {
      message: string;
      sender_id: string;
      sender_image_url: string;
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          avatar: data.sender_image_url ?? "https://bit.ly/broken-link",
          position: data.sender_id === userIdNumber ? "right" : "left",
          text: data.message,
          date: viewDate(new Date()),
          id: prev.length,
          userId: data.sender_id,
        },
      ]);
    };

    socket?.on("receive_message", handleReceiveMessage);

    return () => {
      socket?.off("receive_message", handleReceiveMessage);
      socket?.disconnect();
    };
  }, [roomId, tradeIdNumber, userIdNumber]);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const check = checkPatter(message.trim());
    if (check.isProhibited) {
      toast({
        title: "投稿できません",
        description: check.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    const socket = getSocket();
    socket?.emit("send_message", {
      room: roomId,
      message: message,
      trade_id: tradeIdNumber,
      sender_id: userIdNumber,
    });
    setMessage("");
  }, [message, roomId, toast, tradeIdNumber, userIdNumber]);

  // const handleKeyPress = useCallback(
  //   (e: React.KeyboardEvent) => {
  //     if (e.key === "Enter" && !e.shiftKey) {
  //       e.preventDefault();
  //       sendMessage();
  //     }
  //   },
  //   [sendMessage]
  // );

  const imageMatchHandler = useCallback((text: string) => {
    const imageMatch = text.match(/\[画像\]\((.*?)\)/);
    const isImageMessage = !!imageMatch;
    const imageUrl = imageMatch?.[1];

    if (isImageMessage) {
      return (
        <Box maxW="300px" p={2} borderRadius="lg" bg="gray.100">
          <Image src={imageUrl} alt="送信画像" maxW="200px" borderRadius="md" />
        </Box>
      );
    } else {
      return (
        <Text
          fontSize="md"
          p={3}
          borderRadius="lg"
          bg="blue.50"
          maxW="100%"
          whiteSpace="pre-wrap"
          boxShadow="sm"
        >
          {text}
        </Text>
      );
    }
  }, []);

  return (
    <Card
      w="100%"
      borderWidth={1}
      borderColor="#edf2f7"
      bg="white"
      h={{ base: "calc(100vh - 400px)", md: "calc(100vh - 280px)" }}
      minH={{ base: "400px", md: "500px" }}
      display="flex"
      flexDirection="column"
    >
      {/* メッセージ表示部分 */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        bg="gray.50"
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        <VStack spacing={3} align="stretch">
          {messages.map((msg, index) => (
            <HStack
              key={index}
              w="100%"
              justifyContent={
                msg.position === "right" ? "flex-end" : "flex-start"
              }
            >
              {msg.position === "left" && <Avatar size="sm" src={msg.avatar} />}
              <VStack
                align={msg.position === "right" ? "flex-end" : "flex-start"}
                spacing={1}
                maxW="100%"
              >
                {imageMatchHandler(msg.text)}
                <Text fontSize="xs" color="gray.500">
                  {msg.date}
                </Text>
              </VStack>
              {msg.position === "right" && (
                <Avatar size="sm" src={msg.avatar} />
              )}
            </HStack>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* 入力エリア */}
      <Box
        p={4}
        borderTop="1px"
        borderColor="gray.200"
        bg="white"
        hidden={memorizeChatItemData.status === "completed"}
      >
        <HStack>
          {/* <Input
            placeholder="メッセージを入力..."
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            bg="gray.50"
            borderColor="gray.300"
            _focus={{
              borderColor: "blue.400",
              bg: "white",
            }}
          /> */}
          <Textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="メッセージを入力..."
            bg="gray.50"
            resize="none"
            rows={2}
            maxLength={500}
          />
          <Button
            colorScheme="orange"
            onClick={sendMessage}
            isDisabled={!message.trim()}
          >
            送信
          </Button>
        </HStack>
      </Box>
    </Card>
  );
};

export default ChatLayout;
