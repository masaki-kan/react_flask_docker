import { FC, useState, useCallback } from "react";
import { savedListType } from "../../types/savedType";
import { VStack, Box, Flex, Badge, Grid, GridItem } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useMyProfile from "../../hooks/useProfile";
import OptimizedImage from "../render/optimizedImage";
import { TRADE_STATUS } from "../../constants/tradeStatus";
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
          if (save.status !== TRADE_STATUS.COMPLETED) {
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
          const getStatusBadge = (status: string) => {
            // 大文字・小文字を統一（小文字に変換）
            const normalizedStatus = status.toLowerCase();

            const statusConfig: Record<
              string,
              { color: string; label: string }
            > = {
              [TRADE_STATUS.PENDING]: { color: "yellow", label: "申請中" },
              [TRADE_STATUS.PURCHASED]: { color: "blue", label: "選択済" },
              [TRADE_STATUS.SHIPPED]: { color: "purple", label: "発送済み" },
              [TRADE_STATUS.COMPLETED]: { color: "green", label: "取引完了" },
              [TRADE_STATUS.CANCELLED]: { color: "red", label: "取引キャンセル" },
              [TRADE_STATUS.PRICE_PROPOSED]: { color: "orange", label: "金額提案中" },
              [TRADE_STATUS.PRICE_AGREED]: { color: "cyan", label: "金額合意済み" },
              awaiting_payment: { color: "orange", label: "入金待ち" },
              [TRADE_STATUS.PAID]: { color: "teal", label: "決済済み" },
              [TRADE_STATUS.BUYER_RECEIVED]: { color: "blue", label: "受取確認済み" },
            };

            return (
              statusConfig[normalizedStatus] || {
                color: "gray",
                label: status,
              }
            );
          };

          const statusInfo = getStatusBadge(save.status);

          return (
            <GridItem
              key={index}
              cursor={save.status !== TRADE_STATUS.COMPLETED ? "pointer" : "default"}
              onClick={() => {
                saveTransition(save.trade_id, save.last_message_time);
              }}
              bg="white"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm"
              transition="all 0.3s ease"
              _hover={
                save.status !== TRADE_STATUS.COMPLETED
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
                  p={2}
                  zIndex={2}
                ></Box>
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
                {/* <Image
                    src={save.image_url}
                    alt="取引商品画像"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    transition="transform 0.3s ease"
                    _groupHover={{ transform: "scale(1.05)" }}
                  /> */}
                <Box position="relative" w="full">
                  <OptimizedImage
                    src={save.image_url}
                    alt={save.title}
                    aspectRatio={1}
                    objectFit="cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </Box>

                {/* 商品情報 */}
                {/* <VStack align="start" p={2} spacing={2}> */}
                {/* <Text
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "md" }}
                    noOfLines={2}
                    lineHeight="short"
                  >
                    {save.title}
                  </Text> */}
                {/* <Divider /> */}
                {/* 取引相手情報 */}
                {/* <HStack spacing={3} w="full">
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
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        noOfLines={1}
                        whiteSpace={"wrap"}
                        wordBreak={"break-all"}
                      >
                        {save.user_name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {save.seller_id === memorizeProfile.profile.id
                          ? "購入者"
                          : "出品者"}
                      </Text>
                    </VStack>
                  </HStack> */}

                {/* 取引開始日 */}
                {/* <Box w="full">
                    <Text fontSize="xs" color="gray.500">
                      取引開始日
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {viewDate(save.trade_created_at)}
                    </Text>
                  </Box> */}

                {/* ブランド・タイプ情報（あれば表示） */}
                {/* {(save.brand || save.type) && (
                    <VStack spacing={2} w={"full"} align={"start"}>
                      {save.brand && (
                        <Badge
                          display={{ base: "block", md: "flex" }}
                          whiteSpace={"wrap"}
                          colorScheme="purple"
                          fontSize="xs"
                          noOfLines={1}
                        >
                          {save.brand.name}
                        </Badge>
                      )}
                      {save.type && (
                        <Badge
                          display={{ base: "block", md: "flex" }}
                          whiteSpace={"wrap"}
                          colorScheme="teal"
                          fontSize="xs"
                          noOfLines={1}
                        >
                          {itemParts
                            .filter((type) => type.key === Number(save.type))
                            .map((type) => {
                              return type.name;
                            })}
                        </Badge>
                      )}
                    </VStack>
                  )} */}
                {/* </VStack> */}
              </VStack>
            </GridItem>
          );
        })}
      </Grid>
    </Flex>
  );
};

export default RenderSaved;
