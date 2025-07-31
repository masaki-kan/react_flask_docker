import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  IconButton,
  Avatar,
  Spinner,
  useToast,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { threadPostApi, fetchThreadMessages } from "../../api/threadApi";
import useMyProfile from "../../hooks/useProfile";
import { getSocket, disconnectSocket } from "../../utils/socket/getSocket";
import { route } from "../../route/routeConst";

interface ThreadMessage {
  thread_message_id: number;
  user_id: string;
  user_name: string;
  user_location: string;
  user_image: string;
  message: string;
  created_at: string;
}

interface FollowCounts {
  following: number;
  followers: number;
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
  const [followCounts, setFollowCounts] = useState<FollowCounts>({
    following: 0,
    followers: 0,
  });
  const [initialLoad, setInitialLoad] = useState(true);

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
      console.log("filter", filter);
      try {
        const data = await fetchThreadMessages(
          pageNum,
          20,
          filter,
          memorizeProfile.profile.id
        );

        if (reset) {
          setMessages(data.messages);
          setPage(1);
        } else {
          setMessages((prev) => [...prev, ...data.messages]);
        }

        setHasMore(data.has_more);
        setPage(pageNum);

        // フォローカウントを更新
        if (data.follow_counts) {
          setFollowCounts(data.follow_counts);
        }

        setInitialLoad(false);
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

  // Socket接続の初期化
  useEffect(() => {
    const socketInstance = getSocket();

    // スレッドルームに参加
    socketInstance.emit("join_thread");

    // 新しいメッセージのリスナー
    socketInstance.on("new_thread_message", () => {
      // 最新のメッセージを取得
      fetchMessages(1, filterType, true);
    });

    // 初回データ取得
    fetchMessages(1, filterType, true);

    // クリーンアップ
    return () => {
      socketInstance.off("new_thread_message");
      socketInstance.emit("leave_thread");
      disconnectSocket();
    };
  }, [fetchMessages, filterType]); // filterTypeが変わったら再接続

  // タブ変更時
  const handleTabChange = (index: number) => {
    const filters: ("all" | "following" | "followers")[] = [
      "all",
      "following",
      "followers",
    ];
    setFilterType(filters[index]);
    setPage(1);
    setMessages([]); // メッセージをリセット
    setInitialLoad(true);
  };

  // メッセージ投稿
  const handleSubmit = async () => {
    if (!newMessage.trim() || posting) return;

    setPosting(true);

    const response = await threadPostApi(
      memorizeProfile.profile.id,
      newMessage.trim()
    );

    if (response.ok) {
      setNewMessage("");
      toast({
        title: "投稿しました",
        status: "success",
        duration: 2000,
      });

      // 少し遅延を入れてから最新を取得
      setTimeout(() => {
        fetchMessages(1, filterType, true);
      }, 100);
    }
    setPosting(false);
  };

  // ユーザープロフィールへ遷移
  const handleUserClick = (userId: string) => {
    if (String(userId) === memorizeProfile.profile.id) {
      navigate(route.home);
    } else {
      navigate(`${route.shopPage}?user=${userId}`);
    }
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

  // タブのラベルを動的に生成
  const getTabLabel = (type: "all" | "following" | "followers") => {
    switch (type) {
      case "all":
        return "すべて";
      case "following":
        return followCounts.following > 0
          ? `フォロー中 (${followCounts.following})`
          : "フォロー中";
      case "followers":
        return followCounts.followers > 0
          ? `フォロワー (${followCounts.followers})`
          : "フォロワー";
      default:
        return "";
    }
  };

  // メッセージがない場合の表示
  const renderEmptyState = () => {
    if (loading && initialLoad) return null;

    let message = "";
    switch (filterType) {
      case "following":
        message = "フォロー中のユーザーからのメッセージはありません";
        break;
      case "followers":
        message = "フォロワーからのメッセージはありません";
        break;
      default:
        message = "まだメッセージがありません";
    }

    return (
      <Center h="200px">
        <Text color="gray.500">{message}</Text>
      </Center>
    );
  };

  return (
    <VStack h="100%" spacing={0} mt={4}>
      {/* ヘッダー */}
      <Box
        w="100%"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        p={4}
      >
        <Tabs
          variant="soft-rounded"
          onChange={handleTabChange}
          index={["all", "following", "followers"].indexOf(filterType)}
        >
          <TabList>
            <Tab>{getTabLabel("all")}</Tab>
            <Tab isDisabled={followCounts.following === 0}>
              {getTabLabel("following")}
            </Tab>
            <Tab isDisabled={followCounts.followers === 0}>
              {getTabLabel("followers")}
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      {/* メッセージエリア */}
      <Box
        ref={scrollContainerRef}
        flex={1}
        w="100%"
        onScroll={handleScroll}
        bg={useColorModeValue("gray.50", "gray.900")}
      >
        <VStack
          spacing={0}
          align="stretch"
          p={4}
          overflowY={"auto"}
          h="calc(100vh - 25rem)"
        >
          {messages.length === 0 && !loading
            ? renderEmptyState()
            : messages.map((msg) => (
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
            maxLength={100}
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
          {newMessage.length}/100
        </Text>
      </Box>
    </VStack>
  );
};

export default ThreadPage;
