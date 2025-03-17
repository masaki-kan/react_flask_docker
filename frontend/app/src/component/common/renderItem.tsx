import React, { FC } from "react";
import { motion } from "framer-motion";
import { Grid, Image, Text, Card, Avatar, HStack } from "@chakra-ui/react";
import { itemListType } from "../../types/item";

type RebderItemProps = {
  itemList: itemListType[];
};

const RebderItem: FC<RebderItemProps> = React.memo(({ itemList }) => {
  const MotionCard = motion(Card);

  return (
    <Grid
      width="full"
      templateColumns={{
        base: "repeat(2, 1fr)",
        md: "repeat(auto-fit, minmax(158px, 1fr))",
      }}
      gap={3}
      p={4}
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
              2024/05/21 22:54:20
            </Text>
            <Avatar
              size={"sm"}
              name={"my name"}
              cursor={"pointer"}
              src="https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png"
            />
          </HStack>

          <Image
            cursor={"pointer"}
            src={product.image}
            alt={""}
            w="full"
            h="auto"
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
            borderRadius="md"
          />
          <Text color="#181411" fontSize="base" fontWeight="medium">
            {product.itemName}
          </Text>

          <Text color="#887563" fontSize="md" fontWeight="normal">
            ¥{product.price}
          </Text>
        </MotionCard>
      ))}
    </Grid>
  );
});

export default RebderItem;
