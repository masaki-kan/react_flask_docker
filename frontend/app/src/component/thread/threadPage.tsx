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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  Card,
} from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import { FaUserCircle, FaEllipsisV, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  threadPostApi,
  fetchThreadMessages,
  deleteThreadMessageApi,
} from "../../api/threadApi";
import useMyProfile from "../../hooks/useProfile";
import { getSocket, disconnectSocket } from "../../utils/socket/getSocket";
import { route } from "../../route/routeConst";
import { checkPatter } from "../../utils/varidate/detectProhibitedContent";
import { viewDate } from "../../utils/date/format";

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
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const toast = useToast();
  const { memorizeProfile } = useMyProfile();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBgColor = useColorModeValue("gray.50", "gray.700");
  const linkColor = useColorModeValue("blue.500", "blue.300");

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // URLをリンクに変換する関数
  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Link
            key={index}
            href={part}
            isExternal
            color={linkColor}
            textDecoration="underline"
            _hover={{ textDecoration: "none" }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  // メッセージ削除
  const handleDeleteMessage = async (messageId: number) => {
    setDeletingId(messageId);

    const response = await deleteThreadMessageApi(
      messageId,
      memorizeProfile.profile.id
    );

    if (response.ok) {
      setMessages((prev) =>
        prev.filter((msg) => msg.thread_message_id !== messageId)
      );

      toast({
        title: "削除しました",
        status: "success",
        duration: 2000,
      });
    } else {
      toast({
        title: "エラー",
        description: "削除に失敗しました",
        status: "error",
        duration: 3000,
      });
    }

    setDeletingId(null);
  };

  // メッセージ取得
  const fetchMessages = useCallback(
    async (pageNum: number, filter: string, reset = false) => {
      setLoading(true);
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

    socketInstance.emit("join_thread");

    socketInstance.on("new_thread_message", () => {
      fetchMessages(1, filterType, true);
    });

    fetchMessages(1, filterType, true);

    return () => {
      socketInstance.off("new_thread_message");
      socketInstance.emit("leave_thread");
      disconnectSocket();
    };
  }, [fetchMessages, filterType]);

  // スクロールでさらに読み込み
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        fetchMessages(page + 1, filterType, false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchMessages, page, filterType]);

  // タブ変更時
  const handleTabChange = (index: number) => {
    const filters: ("all" | "following" | "followers")[] = [
      "all",
      "following",
      "followers",
    ];
    setFilterType(filters[index]);
    setPage(1);
    setMessages([]);
    setInitialLoad(true);
  };

  // メッセージ投稿
  const handleSubmit = async () => {
    if (!newMessage.trim() || posting) return;

    const check = checkPatter(newMessage.trim());
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

      setTimeout(() => {
        fetchMessages(1, filterType, true);
        scrollToBottom();
      }, 100);
    }
    setPosting(false);
  };

  // ユーザープロフィールへ遷移
  const handleUserClick = (userId: string) => {
    if (String(userId) === memorizeProfile.profile.id) {
      navigate(route.profile);
    } else {
      navigate(`${route.shopPage}?user=${userId}`);
    }
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
    <>
      {/* タブヘッダー */}
      <Box
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        p={1}
        mb={2}
        zIndex={100}
        borderRadius="md"
        w="100%"
        overflowX="hidden"
      >
        <Tabs
          variant="soft-rounded"
          onChange={handleTabChange}
          index={["all", "following", "followers"].indexOf(filterType)}
          size="sm"
        >
          <TabList>
            <Tab fontSize="sm">{getTabLabel("all")}</Tab>
            <Tab fontSize="sm" isDisabled={followCounts.following === 0}>
              {getTabLabel("following")}
            </Tab>
            <Tab fontSize="sm" isDisabled={followCounts.followers === 0}>
              {getTabLabel("followers")}
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      {/* メッセージエリア */}
      <Card
        w="100%"
        borderWidth={1}
        borderColor="#edf2f7"
        bg="white"
        h={{ base: "calc(100vh - 200px)", md: "calc(100vh - 200px)" }}
        minH={{ base: "400px", md: "500px" }}
        display="flex"
        flexDirection="column"
      >
        <Box
          ref={scrollContainerRef}
          flex="1"
          overflowY="auto"
          p={2}
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
          <VStack spacing={2} align="stretch">
            {messages.length === 0 && !loading
              ? renderEmptyState()
              : messages.map((msg) => (
                  <Box
                    key={msg.thread_message_id}
                    bg={bgColor}
                    p={1}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <HStack align="start" spacing={3}>
                      <Box
                        cursor="pointer"
                        onClick={() => handleUserClick(msg.user_id)}
                        flexShrink={0}
                      >
                        {msg.user_image ? (
                          <Avatar size="sm" src={msg.user_image} />
                        ) : (
                          <FaUserCircle size={32} color="gray.500" />
                        )}
                      </Box>

                      <VStack align="start" flex={1} spacing={1}>
                        <HStack width="full" justify="space-between">
                          <HStack flexWrap="wrap" spacing={1}>
                            <Text
                              fontWeight="bold"
                              cursor="pointer"
                              fontSize="sm"
                              _hover={{ textDecoration: "underline" }}
                              onClick={() => handleUserClick(msg.user_id)}
                            >
                              {msg.user_name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {msg.user_location}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {viewDate(new Date(msg.created_at))}
                            </Text>
                          </HStack>

                          {String(msg.user_id) ===
                            memorizeProfile.profile.id && (
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FaEllipsisV />}
                                variant="ghost"
                                size="xs"
                                aria-label="Options"
                                isDisabled={
                                  deletingId === msg.thread_message_id
                                }
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FaTrash />}
                                  onClick={() =>
                                    handleDeleteMessage(msg.thread_message_id)
                                  }
                                  color="red.500"
                                  fontSize="sm"
                                >
                                  削除
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          )}
                        </HStack>

                        <Text
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                          overflowWrap="break-word"
                          maxWidth="100%"
                          fontSize="sm"
                          lineHeight="1.5"
                          py={2}
                        >
                          {renderMessageWithLinks(msg.message)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}

            {loading && (
              <Box textAlign="center" py={4}>
                <Spinner size="md" />
              </Box>
            )}

            {!hasMore && messages.length > 0 && (
              <Text textAlign="center" color="gray.500" py={4} fontSize="sm">
                すべて読み込みました
              </Text>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* 投稿エリア（下部に固定） */}
        <Box
          p={4}
          borderTop="1px"
          borderColor="gray.200"
          bg="white"
          position="relative"
        >
          <HStack spacing={2}>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力... (URLは自動的にリンクになります)"
              bg={inputBgColor}
              resize="none"
              rows={2}
              maxLength={100}
              fontSize="16px" // スマホでの自動ズームを防ぐ
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.400",
                bg: "white",
              }}
              onFocus={(e) => {
                e.preventDefault();
                // フォーカス時の自動スクロールを防ぐ
                const scrollY = window.scrollY;
                setTimeout(() => {
                  window.scrollTo(0, scrollY);
                }, 0);
              }}
            />
            <IconButton
              aria-label="送信"
              icon={<IoSend />}
              colorScheme="orange"
              size="md"
              onClick={handleSubmit}
              isLoading={posting}
              isDisabled={!newMessage.trim()}
            />
          </HStack>
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
            {newMessage.length}/100
          </Text>
        </Box>
      </Card>
    </>
  );
};

export default ThreadPage;
