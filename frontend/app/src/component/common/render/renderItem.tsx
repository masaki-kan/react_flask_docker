import React, { FC, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Grid,
  Image,
  Text,
  Card,
  Avatar,
  HStack,
  Tag,
  VStack,
  Box,
} from "@chakra-ui/react";
import { itemListType } from "../../../types/itemType";
import { viewDate } from "../date/format";
import { useLocation } from "react-router-dom";
import { route } from "../../../route/routeConst";
import { useEffectOnce } from "react-use";
import { tradeStatusFlags } from "../../../consts/profileConsts";

type RebderItemProps = {
  itemList: itemListType[];
  navigate: (index: string) => void;
  avatar?: boolean;
};

const RebderItem: FC<RebderItemProps> = React.memo(
  ({ itemList, avatar = true, navigate }) => {
    const location = useLocation();
    const MotionCard = motion.create(Card);

    const [isMatch, setIsMatch] = useState<boolean>(false);

    useEffectOnce(() => {
      if (location.pathname === route.home) {
        setIsMatch(true);
      }
    });

    const getTradeStatusFlag = useCallback((tradeStatusFlag: number) => {
      const tradeStatus = tradeStatusFlags.filter((flag) => {
        return flag.value === tradeStatusFlag;
      });
      return <>{tradeStatus[0].text}</>;
    }, []);

    return (
      <Grid
        width="full"
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(5, 1fr)",
        }}
        gap={3}
        my={4}
        overflowY={"auto"}
        height={isMatch ? "auto" : "550px"}
        overflow={"visible"}
      >
        {itemList.map((product, index) => (
          <MotionCard
            key={index}
            display="flex"
            zIndex={0}
            flexDirection="column"
            height={"max-content"}
            position="relative"
            bg="white"
            initial={{ opacity: 0, y: 30 }} // 初期状態
            animate={{ opacity: 1, y: 0 }} // アニメーション後の状態
            transition={{ delay: index * 0.1 }} // 遅延時間をインデックスに応じて設定
          >
            <HStack
              justifyContent={"space-between"}
              alignItems={"center"}
              p={2}
            >
              <Box
                px={1}
                borderRadius="md"
                fontWeight="bold"
                bg="red.400"
                color="white"
                fontSize={"xs"}
                position="absolute"
                top={-3}
                right={0}
              >
                {getTradeStatusFlag(product.tradeStatusFlag)}
              </Box>
              <Text color="#887563" fontSize={"xs"}>
                {viewDate(product.uploaded_at)}
              </Text>
              <Avatar
                hidden={avatar}
                size={"xs"}
                name={"my name"}
                cursor={"pointer"}
                src={product.profile_image}
              />
            </HStack>
            <Image
              cursor={"pointer"}
              src={product.images ? product.images[0] : ""}
              w="full"
              height={"150px"}
              objectFit={"contain"}
              bgPosition="center"
              bgRepeat="no-repeat"
              bgColor={"white"}
              bgSize="cover"
              onClick={() => navigate(product.itemId)}
            />
            <VStack spacing={2} bg={"white"} w={"100%"} my={2}>
              <Text color="#181411" fontSize="xs" fontWeight="medium">
                {product.title}
              </Text>

              <Tag size={"xs"} variant="solid">
                <Text fontSize="xs" fontWeight="medium" p={1}>
                  {product.brand.name}
                </Text>
              </Tag>
            </VStack>
          </MotionCard>
        ))}
      </Grid>
    );
  }
);

export default RebderItem;
