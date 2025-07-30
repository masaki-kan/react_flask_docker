import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  IconButton,
  Avatar,
  Container,
  Spinner,
  useToast,
  Button,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { threadPostApi } from "../../api/threadApi";
import useMyProfile from "../../hooks/useProfile";

interface ThreadMessage {
  thread_message_id: number;
  user_id: number;
  user_name: string;
  user_location: string;
  user_image: string;
  message: string;
  created_at: string;
}

const ThreadPage: React.FC = () => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<
    "all" | "following" | "followers"
  >("all");
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { memorizeProfile } = useMyProfile();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBgColor = useColorModeValue("gray.50", "gray.700");

  // メッセージ取得
  const fetchMessages = useCallback(
    async (pageNum: number, filter: string, reset = false) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/thread/messages?page=${pageNum}&limit=20&filter=${filter}&user_id=${memorizeProfile.profile.id}`
        );
        const data = await response.json();

        if (reset) {
          setMessages(data.messages);
        } else {
          setMessages((prev) => [...prev, ...data.messages]);
        }

        setHasMore(data.has_more);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "エラー",
          description: "メッセージの取得に失敗しました",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [memorizeProfile.profile.id, toast]
  );

  // 初回読み込みとWebSocket接続
  useEffect(() => {
    fetchMessages(1, filterType, true);

    // WebSocket接続
    const newSocket = io();
    newSocket.emit("join_thread");

    newSocket.on("new_thread_message", () => {
      // 新しいメッセージが投稿されたら最新を取得
      console.log("ko");
      fetchMessages(1, filterType, true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [filterType, fetchMessages]);

  // タブ変更時
  const handleTabChange = (index: number) => {
    const filters: ("all" | "following" | "followers")[] = [
      "all",
      "following",
      "followers",
    ];
    setFilterType(filters[index]);
    setPage(1);
  };

  // メッセージ投稿
  const handleSubmit = async () => {
    if (!newMessage.trim() || posting) return;

    setPosting(true);

    const response = await threadPostApi(
      memorizeProfile.profile.id,
      newMessage.trim()
    );

    if (response !== undefined && response.ok) {
      setNewMessage("");
      // メッセージ投稿成功後、最新を取得
      fetchMessages(1, filterType, true);

      toast({
        title: "投稿しました",
        status: "success",
        duration: 2000,
      });
    }
    setPosting(false);
  };

  // ユーザープロフィールへ遷移
  const handleUserClick = (userId: number) => {
    navigate(`/shopPage?user=${userId}`);
  };

  // スクロールでさらに読み込み
  const handleScroll = () => {
    if (!scrollContainerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchMessages(page + 1, filterType, false);
    }
  };

  // 日時フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MM/dd HH:mm", { locale: ja });
  };

  return (
    <Container maxW="container.md" h="100vh" p={0}>
      <VStack h="100%" spacing={0}>
        {/* ヘッダー */}
        <Box
          w="100%"
          bg={bgColor}
          borderBottom="1px"
          borderColor={borderColor}
          p={4}
        >
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            スレッド
          </Text>

          {/* タブ */}
          <Tabs variant="soft-rounded" onChange={handleTabChange}>
            <TabList>
              <Tab>すべて</Tab>
              <Tab>フォロー</Tab>
              <Tab>フォロワー</Tab>
            </TabList>
          </Tabs>
        </Box>

        {/* メッセージエリア */}
        <Box
          ref={scrollContainerRef}
          flex={1}
          w="100%"
          overflowY="auto"
          onScroll={handleScroll}
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <VStack spacing={0} align="stretch" p={4}>
            {messages.map((msg) => (
              <Box
                key={msg.thread_message_id}
                w="100%"
                bg={bgColor}
                p={4}
                mb={2}
                borderRadius="lg"
                boxShadow="sm"
              >
                <HStack align="start" spacing={3}>
                  {/* アバター */}
                  <Box
                    cursor="pointer"
                    onClick={() => handleUserClick(msg.user_id)}
                  >
                    {msg.user_image ? (
                      <Avatar size="md" src={msg.user_image} />
                    ) : (
                      <FaUserCircle size={40} color="gray.500" />
                    )}
                  </Box>

                  {/* メッセージ内容 */}
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack>
                      <Text
                        fontWeight="bold"
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                        onClick={() => handleUserClick(msg.user_id)}
                      >
                        {msg.user_name}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {msg.user_location}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {formatDate(msg.created_at)}
                      </Text>
                    </HStack>

                    <Text whiteSpace="pre-wrap">{msg.message}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}

            {loading && (
              <Box textAlign="center" py={4}>
                <Spinner />
              </Box>
            )}

            {!hasMore && messages.length > 0 && (
              <Text textAlign="center" color="gray.500" py={4}>
                すべて読み込みました
              </Text>
            )}

            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* 投稿エリア */}
        <Box
          w="100%"
          bg={bgColor}
          borderTop="1px"
          borderColor={borderColor}
          p={4}
        >
          <HStack spacing={2}>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              bg={inputBgColor}
              resize="none"
              rows={2}
              maxLength={500}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <IconButton
              aria-label="送信"
              icon={<IoSend />}
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={posting}
              isDisabled={!newMessage.trim()}
            />
          </HStack>
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
            {newMessage.length}/500
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default ThreadPage;
