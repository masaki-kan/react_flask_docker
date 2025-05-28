import { FC, useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Input,
  Button,
  HStack,
  Text,
  Avatar,
  Box,
  Image,
  Card,
  useBreakpointValue,
} from "@chakra-ui/react";
import useChat from "../../hooks/useChat";
import { FaRegImage } from "react-icons/fa6";
import { useEffectOnce } from "react-use";
import { messagesType } from "../../types/chatType";
import { viewDate } from "../common/date/format";

const socket = io("http://localhost:5001");

const ChatLayout: FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [message, setMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const { uploadImage, memorizeChatMessages, memorizeChatHight } = useChat();
  const searchParams = new URLSearchParams(location.search);
  const tradeIdNumver = searchParams.get("item_id");
  const userIdNumver = searchParams.get("user_id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [messages, setMessages] = useState<messagesType[]>([]);

  useEffectOnce(() => {
    if (tradeIdNumver !== null) {
      setRoomId(`room_${tradeIdNumver}`);
    }
  });

  useEffect(() => {
    setMessages(memorizeChatMessages);
  }, [memorizeChatMessages]);

  useEffect(() => {
    const socket = io("http://localhost:5001");
    socketRef.current = socket;

    // 接続確認（初期化直後に発火しない可能性を回避）
    if (socket.connected) {
      console.log("✅ Already connected to Socket.IO server");
    } else {
      socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO server");
      });
    }

    // トレードidが部屋番号
    socket.emit("join", { room: roomId });

    // ブロードキャストから取得
    const handleReceiveMessage = (data: {
      message: string;
      sender_id: string;
      sender_image_url: string;
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          avatar: data.sender_image_url ?? "https://bit.ly/broken-link",
          position: data.sender_id === userIdNumver ? "right" : "left",
          text: data.message,
          date: viewDate(new Date()),
          id: prev.length,
          userId: data.sender_id,
        },
      ]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [roomId, tradeIdNumver, userIdNumver]);

  // 🔵 画像選択
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setImage(base64Image);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // テキスト
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  // メッセージ送信（テキストまたは画像）
  const sendMessage = useCallback(async () => {
    let messageToSend = message;
    // 画像がある場合はアップロードしてURL取得
    if (image && imageFile) {
      const imageUrl = await uploadImage(imageFile);

      if (imageUrl) {
        messageToSend += `\n[画像](${imageUrl})`; // マークダウン形式にしてもよい
        socket.emit("send_message", {
          room: roomId,
          message: messageToSend,
          trade_id: tradeIdNumver,
          sender_id: userIdNumver,
        });
      }
      setImage(null);
      setImageFile(null);
    } else {
      socket.emit("send_message", {
        room: roomId,
        message: messageToSend,
        trade_id: tradeIdNumver,
        sender_id: userIdNumver,
      });
      setMessage("");
    }
  }, [
    image,
    imageFile,
    message,
    roomId,
    tradeIdNumver,
    uploadImage,
    userIdNumver,
  ]);

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
          p={2}
          borderRadius="lg"
          bg="blue.100"
          maxW="70%"
          whiteSpace="pre-wrap"
        >
          {text}
        </Text>
      );
    }
  }, []);

  return (
    <>
      {/* 右：チャットエリア */}
      <Card
        w={{ base: "100%", md: "70%" }}
        mx={"auto"}
        borderWidth={1}
        borderColor={"#edf2f7"}
        p={2}
        bg={"white"}
        h={isMobile ? "600px" : memorizeChatHight}
      >
        {/* メッセージ表示部分（スクロール） */}
        <Box overflowY="auto" w={"full"}>
          {messages.map((msg, index) => (
            <HStack
              key={index}
              w="100%" // ← ここで左右いっぱいにする
              justifyContent={
                msg.position === "right" ? "flex-end" : "flex-start"
              }
              my={2}
            >
              {msg.position === "left" && <Avatar src={msg.avatar} />}
              {imageMatchHandler(msg.text)}
              {msg.position === "right" && <Avatar src={msg.avatar} />}
            </HStack>
          ))}
        </Box>
        {/* 入力エリア：スクロール固定 */}
        <Box pt={2} w={"full"}>
          <HStack>
            <FaRegImage
              onClick={() => fileInputRef.current?.click()}
              cursor="pointer"
              fontSize="40px"
              color="gray.600"
            />
            <Input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handleFileChange}
            />
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={handleMessageChange}
            />
            <Button onClick={sendMessage}>Send</Button>
          </HStack>
        </Box>
      </Card>
    </>
  );
};

export default ChatLayout;
