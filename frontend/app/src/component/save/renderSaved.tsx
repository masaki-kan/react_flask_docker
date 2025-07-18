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
  Badge,
  Divider,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { viewDate } from "../common/date/format";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import { FaExclamation, FaUserCircle } from "react-icons/fa";
import { itemParts } from "../../consts/itemConsts";

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
    <Flex direction="column" height="80%" overflowY={"auto"} h={"600px"}>
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)", // モバイル: 1列（縦スクロール）
          sm: "repeat(2, 1fr)", // 小さいスクリーン: 2列
          md: "repeat(2, 1fr)", // タブレット: 2列
          lg: "repeat(3, 1fr)", // デスクトップ: 3列
          xl: "repeat(4, 1fr)", // 大画面: 4列
        }}
        gap={{ base: 3, md: 4 }}
        px={{ base: 1, md: 4 }}
      >
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

          // ステータスに応じた色とラベル
          type TradeStatus =
            | "pending"
            | "purchased"
            | "shipped"
            | "completed"
            | "cancelled";

          const getStatusBadge = (status: string) => {
            const statusConfig: Record<
              TradeStatus,
              { color: string; label: string }
            > = {
              pending: { color: "yellow", label: "交渉中" },
              purchased: { color: "blue", label: "購入済" },
              shipped: { color: "purple", label: "発送済" },
              completed: { color: "green", label: "取引完了" },
              cancelled: { color: "red", label: "キャンセル" },
            };
            return (
              statusConfig[status as TradeStatus] || {
                color: "gray",
                label: status,
              }
            );
          };

          const statusInfo = getStatusBadge(save.status);

          return (
            <GridItem
              key={index}
              cursor={save.status !== "completed" ? "pointer" : "default"}
              onClick={() => {
                if (save.status !== "completed") {
                  saveTransition(save.trade_id, save.last_message_time);
                }
              }}
              bg="white"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm"
              transition="all 0.3s ease"
              _hover={
                save.status !== "completed"
                  ? {
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                      bgColor: "#f9f8f7",
                    }
                  : {}
              }
              position="relative"
              border="1px solid"
              borderColor="gray.200"
            >
              {/* 新着バッジ */}
              {isNew && (
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  borderRadius="50%"
                  bgColor="#b03a3a"
                  p={1.5}
                  zIndex={2}
                >
                  <FaExclamation size={12} color="white" />
                </Box>
              )}

              {/* ステータスバッジ */}
              <Badge
                position="absolute"
                top={2}
                left={2}
                colorScheme={statusInfo.color}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                zIndex={2}
              >
                {statusInfo.label}
              </Badge>

              <VStack spacing={0} align="stretch">
                {/* 商品画像 */}
                <Box position="relative" h="200px" overflow="hidden">
                  <Image
                    src={save.image_url}
                    alt="取引商品画像"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    transition="transform 0.3s ease"
                    _groupHover={{ transform: "scale(1.05)" }}
                  />
                </Box>

                {/* 商品情報 */}
                <VStack align="start" p={2} spacing={2}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "md" }}
                    noOfLines={2}
                    lineHeight="short"
                  >
                    {save.title}
                  </Text>
                  <Divider />
                  {/* 取引相手情報 */}
                  <HStack spacing={3} w="full">
                    {save.user_image_url !== null ? (
                      <Avatar
                        src={save.user_image_url}
                        size="sm"
                        name={save.user_name}
                      />
                    ) : (
                      <Box ml={4} mx={"auto"}>
                        <FaUserCircle size={"30px"} color="gray.500" />
                      </Box>
                    )}
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {save.user_name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {save.seller_id === memorizeProfile.profile.id
                          ? "購入者"
                          : "出品者"}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* 取引開始日 */}
                  <Box w="full">
                    <Text fontSize="xs" color="gray.500">
                      取引開始日
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {viewDate(save.trade_created_at)}
                    </Text>
                  </Box>

                  {/* ブランド・タイプ情報（あれば表示） */}
                  {(save.brand || save.type) && (
                    <HStack spacing={2} flexWrap="wrap">
                      {save.brand && (
                        <Badge colorScheme="purple" fontSize="xs">
                          {save.brand.name}
                        </Badge>
                      )}
                      {save.type && (
                        <Badge colorScheme="teal" fontSize="xs">
                          {itemParts
                            .filter((type) => type.key === Number(save.type))
                            .map((type) => {
                              return type.name;
                            })}
                        </Badge>
                      )}
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </GridItem>
          );
        })}
      </Grid>
    </Flex>
  );
};

export default RenderSaved;
