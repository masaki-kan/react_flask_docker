import React, { FC } from "react";
import { motion } from "framer-motion";
import { Grid, Image, Text, Card, Avatar, HStack } from "@chakra-ui/react";
import { itemListType } from "../../../types/item";
import { viewDate } from "../date/format";

type RebderItemProps = {
  itemList: itemListType[];
  navigate: (index: number) => void;
  avatar?: boolean;
};

const RebderItem: FC<RebderItemProps> = React.memo(
  ({ itemList, avatar = true, navigate }) => {
    const MotionCard = motion(Card);

    return (
      <Grid
        width="full"
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(5, 1fr)",
        }}
        gap={3}
        py={2}
      >
        {itemList.map((product, index) => (
          <MotionCard
            key={index}
            display="flex"
            flexDirection="column"
            gap={3}
            p={2}
            initial={{ opacity: 0, y: 30 }} // 初期状態
            animate={{ opacity: 1, y: 0 }} // アニメーション後の状態
            transition={{ delay: index * 0.1 }} // 遅延時間をインデックスに応じて設定
          >
            <HStack justifyContent={"space-between"} alignItems={"center"}>
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
              h="200px"
              objectFit={"contain"}
              bgPosition="center"
              bgRepeat="no-repeat"
              bgSize="cover"
              borderRadius="md"
              onClick={() => navigate(Number(product.itemId))}
            />
            <Text color="#181411" fontSize="sm" fontWeight="medium">
              {product.title}
            </Text>
            <Text color="#887563" fontSize="md" fontWeight="normal">
              {product.curr}
              {product.price}
            </Text>
          </MotionCard>
        ))}
      </Grid>
    );
  }
);

export default RebderItem;
