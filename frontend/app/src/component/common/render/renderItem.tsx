import React, { FC, useState } from "react";
import { motion } from "framer-motion";
import {
  Grid,
  Image,
  Text,
  Card,
  Avatar,
  HStack,
  Tag,
  Box,
  VStack,
} from "@chakra-ui/react";
import { itemListType } from "../../../types/itemType";
import { viewDate } from "../date/format";
import { useLocation } from "react-router-dom";
import { route } from "../../../route/routeConst";
import { useEffectOnce } from "react-use";

type RebderItemProps = {
  itemList: itemListType[];
  navigate: (index: number) => void;
  avatar?: boolean;
};

const RebderItem: FC<RebderItemProps> = React.memo(
  ({ itemList, avatar = true, navigate }) => {
    const location = useLocation();
    const MotionCard = motion(Card);

    const [isMatch, setIsMatch] = useState<boolean>(false);

    useEffectOnce(() => {
      if (location.pathname === route.home) {
        setIsMatch(true);
      }
    });

    return (
      <Grid
        width="full"
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(5, 1fr)",
        }}
        gap={3}
        overflowY={"auto"}
        height={isMatch ? "auto" : "550px"}
      >
        {itemList.map((product, index) => (
          <MotionCard
            key={index}
            display="flex"
            flexDirection="column"
            height={"max-content"}
            initial={{ opacity: 0, y: 30 }} // 初期状態
            animate={{ opacity: 1, y: 0 }} // アニメーション後の状態
            transition={{ delay: index * 0.1 }} // 遅延時間をインデックスに応じて設定
          >
            <Box position={"relative"}>
              <HStack
                justifyContent={"space-between"}
                alignItems={"center"}
                p={2}
              >
                <Text color="#887563" fontSize={"xs"}>
                  {viewDate(product.uploaded_at)}
                </Text>
                <Avatar
                  hidden={avatar}
                  size={"sm"}
                  name={"my name"}
                  cursor={"pointer"}
                  src={product.profile_image}
                />
              </HStack>
              <Image
                cursor={"pointer"}
                src={product.images ? product.images[0] : ""}
                alt={""}
                w="full"
                h={isMatch ? "200px" : "300px"}
                objectFit={"contain"}
                bgPosition="center"
                bgRepeat="no-repeat"
                bgColor={"white"}
                bgSize="cover"
                onClick={() => navigate(Number(product.itemId))}
              />
              <VStack
                position={"absolute"}
                spacing={2}
                pt={2}
                opacity={0.8}
                bg={"white"}
                bottom={0}
                w={"100%"}
              >
                <Text color="#181411" fontSize="sm" fontWeight="medium">
                  {product.title}
                </Text>
                <Tag size={"sm"} variant="solid">
                  {product.brand.name}
                </Tag>
                <Text color="#887563" fontSize="sm" fontWeight="normal">
                  {product.curr}
                  {product.price}
                </Text>
              </VStack>
            </Box>
          </MotionCard>
        ))}
      </Grid>
    );
  }
);

export default RebderItem;
