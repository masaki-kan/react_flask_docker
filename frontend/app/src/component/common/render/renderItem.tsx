import React, { FC, useCallback, useState } from "react";
import {
  Grid,
  Image,
  Text,
  Card,
  HStack,
  VStack,
  Box,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { itemListType } from "../../../types/itemType";
import { viewDate } from "../date/format";
import { useLocation } from "react-router-dom";
import { route } from "../../../route/routeConst";
import { useEffectOnce } from "react-use";
import { itemTypeViewHanlder } from "../../common/type/itemTypeView";

type RebderItemProps = {
  itemList: itemListType[];
  navigate: (index: string) => void;
  avatar?: boolean;
};

const RebderItem: FC<RebderItemProps> = React.memo(({ itemList, navigate }) => {
  const location = useLocation();
  const [isMatch, setIsMatch] = useState<boolean>(false);
  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // const textMuted = useColorModeValue("gray.600", "gray.400");
  const overlayBg = useColorModeValue("blackAlpha.700", "blackAlpha.800");

  useEffectOnce(() => {
    if (location.pathname === route.home) {
      setIsMatch(true);
    }
  });

  const getTradeStatusInfo = useCallback((tradeStatusFlag: number) => {
    const statusMap = {
      0: { show: false, text: "", color: "" },
      1: { show: true, text: "取引中", color: "red" },
      2: { show: true, text: "取引完了", color: "gray" },
    };
    return statusMap[tradeStatusFlag as keyof typeof statusMap] || statusMap[0];
  }, []);

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
      mb={10}
      mt={2}
      px={0}
      height={"min-content"}
      overflowY={isMatch ? "visible" : "scroll"}
    >
      {itemList.map((product, index) => {
        const statusInfo = getTradeStatusInfo(product.tradeStatusFlag);
        return (
          <Card
            key={index}
            position="relative"
            bg={bgColor}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            cursor="pointer"
            onClick={() => navigate(product.itemId)}
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "lg",
              transition: "all 0.2s",
            }}
            p={0}
            h="full"
            display="flex"
            flexDirection="column"
          >
            {/* 商品画像コンテナ */}
            <Box
              position="relative"
              w="full"
              paddingBottom={{ base: "120%", sm: "100%" }}
              bg="gray.50"
            >
              <Image
                src={product.images ? product.images[0] : ""}
                alt={product.title}
                position="absolute"
                top="0"
                left="0"
                w="full"
                h="full"
                objectFit="cover"
              />

              {/* SOLD/取引中オーバーレイ（メルカリ風） */}
              {statusInfo.show && (
                <>
                  {/* 半透明オーバーレイ */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="full"
                    h="full"
                    bg={overlayBg}
                    zIndex={1}
                  />

                  {/* 斜めの帯 */}
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

              {/* 日付とアバター（画像上に配置） */}
              <HStack
                position="absolute"
                top={{ base: 1, sm: 2 }}
                left={{ base: 1, sm: 2 }}
                right={{ base: 1, sm: 2 }}
                justify="space-between"
                zIndex={3}
              >
                <Badge
                  bg="blackAlpha.700"
                  color="white"
                  fontSize={{ base: "2xs", sm: "2xs", md: "xs" }}
                  px={{ base: 1, sm: 1.5, md: 2 }}
                  py={0.5}
                  borderRadius="sm"
                >
                  {viewDate(product.uploaded_at)}
                </Badge>
              </HStack>
            </Box>

            {/* 商品情報 */}
            <VStack
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
                {product.title}
              </Text>

              <VStack spacing={1} align="start">
                <Badge
                  display={{ base: "block", md: "flex" }}
                  whiteSpace={"wrap"}
                  colorScheme="purple"
                  fontSize={{ base: "2xs", sm: "2xs", md: "2xs" }}
                  px={{ base: 1.5, sm: 2 }}
                  py={0.5}
                  noOfLines={1}
                >
                  {product.brand.name}
                </Badge>
                {product.type && product.type.length > 0 && (
                  <Badge
                    colorScheme="teal"
                    fontSize={{ base: "2xs", sm: "2xs", md: "2xs" }}
                    px={{ base: 1.5, sm: 2 }}
                    py={0.5}
                    noOfLines={1}
                  >
                    {itemTypeViewHanlder(product.type[0])}
                  </Badge>
                )}
              </VStack>
            </VStack>
          </Card>
        );
      })}
    </Grid>
  );
});

export default RebderItem;
