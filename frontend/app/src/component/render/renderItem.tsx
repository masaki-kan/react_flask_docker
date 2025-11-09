import { FC, useCallback, useState, memo, useMemo } from "react";
import {
  Grid,
  // Text,
  Card,
  // VStack,
  Box,
  // Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { itemListType } from "../../types/itemType";
// import { viewDate } from "../../utils/date/format";
import { useLocation } from "react-router-dom";
import { route } from "../../route/routeConst";
import { useEffectOnce } from "react-use";
// import { itemTypeViewHandler } from "../../utils/type/itemTypeView";
import OptimizedImage from "./optimizedImage";

type RenderItemProps = {
  itemList: itemListType[];
  navigate: (index: string) => void;
  avatar?: boolean;
};

// ItemCardコンポーネントを最適化
const ItemCard = memo<{ item: itemListType; onClick: () => void }>(
  ({ item, onClick }) => {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const overlayBg = useColorModeValue("blackAlpha.700", "blackAlpha.800");

    const statusInfo = useMemo(() => {
      const statusMap = {
        0: { show: false, text: "", color: "" },
        1: { show: true, text: "取引中", color: "red" },
        2: { show: true, text: "取引完了", color: "gray" },
      };
      return (
        statusMap[item.tradeStatusFlag as keyof typeof statusMap] ||
        statusMap[0]
      );
    }, [item.tradeStatusFlag]);

    return (
      <Card
        position="relative"
        bg={bgColor}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        cursor="pointer"
        onClick={onClick}
        p={0}
        h="full"
        display="flex"
        flexDirection="column"
      >
        {/* 商品画像コンテナ */}
        <Box position="relative" w="full">
          <OptimizedImage
            src={item.images?.[0]}
            alt={item.title}
            aspectRatio={1}
            objectFit="cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {/* SOLD/取引中オーバーレイ */}
          {statusInfo.show && (
            <>
              <Box
                position="absolute"
                top="0"
                left="0"
                w="full"
                h="full"
                bg={overlayBg}
                zIndex={1}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%) rotate(-15deg)"
                zIndex={2}
                w="150%"
              >
                <Box
                  bg={statusInfo.color === "red" ? "red.500" : "gray.600"}
                  color="white"
                  py={{ base: 1.5, sm: 2, md: 3 }}
                  fontSize={{ base: "xs", sm: "sm", md: "lg" }}
                  fontWeight="bold"
                  letterSpacing="wider"
                  textAlign="center"
                  boxShadow="0 2px 8px rgba(0,0,0,0.3)"
                >
                  {statusInfo.text}
                </Box>
              </Box>
            </>
          )}
        </Box>
        {/* 日付バッジ */}
        {/* <Badge
          bg="blackAlpha.700"
          color="white"
          fontSize={{ base: "2xs", sm: "2xs", md: "xs" }}
          px={{ base: 1, sm: 1.5, md: 2 }}
          py={0.5}
          borderRadius={0}
        >
          {viewDate(item.uploaded_at)}
        </Badge> */}
        {/* 商品情報 */}
        {/* <VStack
          align="stretch"
          p={{ base: 2, sm: 2.5, md: 3 }}
          spacing={{ base: 1.5, sm: 2 }}
          flex="1"
        >
          <Text
            fontSize={{ base: "sm", sm: "xs", md: "sm" }}
            fontWeight="medium"
            noOfLines={2}
            lineHeight="short"
            minH={{ base: "1.75rem", sm: "2rem", md: "2.5rem" }}
          >
            {item.title}
          </Text>

          <VStack spacing={1} align="start">
            {item.brand?.name && (
              <Badge
                colorScheme="purple"
                fontSize={{ base: "2xs", sm: "2xs", md: "2xs" }}
                px={{ base: 1.5, sm: 2 }}
                py={0.5}
                maxWidth={{ base: "140px", md: "125px" }}
                whiteSpace="normal"
                textAlign="start"
                display="inline-block"
                wordBreak="break-word"
              >
                {item.brand.name}
              </Badge>
            )}
            {item.type && item.type.length > 0 && (
              <Badge
                colorScheme="teal"
                fontSize={{ base: "2xs", sm: "2xs", md: "2xs" }}
                px={{ base: 1.5, sm: 2 }}
                py={0.5}
                maxWidth={{ base: "140px", md: "125px" }}
                whiteSpace="normal"
                textAlign="start"
                display="inline-block"
                wordBreak="break-word"
              >
                {itemTypeViewHandler(item.type[0])}
              </Badge>
            )}
          </VStack>
        </VStack> */}
      </Card>
    );
  }
);

ItemCard.displayName = "ItemCard";

// メインコンポーネント
const RenderItem: FC<RenderItemProps> = memo(({ itemList, navigate }) => {
  const location = useLocation();
  const [isMatch, setIsMatch] = useState<boolean>(false);

  useEffectOnce(() => {
    if (location.pathname === route.profile) {
      setIsMatch(true);
    }
  });

  const handleItemClick = useCallback(
    (itemId: string) => {
      navigate(itemId);
    },
    [navigate]
  );

  return (
    <Grid
      width="full"
      templateColumns={{
        base: "repeat(2, 1fr)",
        sm: "repeat(3, 1fr)",
        md: "repeat(4, 1fr)",
        lg: "repeat(5, 1fr)",
      }}
      gap={{ base: 2, sm: 3, md: 4 }}
      px={0}
      height="min-content"
      overflowY={isMatch ? "visible" : "scroll"}
    >
      {itemList.map((product) => (
        <ItemCard
          key={product.itemId}
          item={product}
          onClick={() => handleItemClick(product.itemId)}
        />
      ))}
    </Grid>
  );
});

RenderItem.displayName = "RenderItem";

export default RenderItem;
