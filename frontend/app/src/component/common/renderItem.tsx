import React, { FC } from "react";
import { Grid, Box, Image, Text } from "@chakra-ui/react";
import { itemListType } from "../../types/item";

type RebderItemProps = {
  itemList: itemListType[];
};

const RebderItem: FC<RebderItemProps> = React.memo(({ itemList }) => {
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
        <Box key={index} display="flex" flexDirection="column" gap={3} pb={3}>
          <Image
            src={product.image}
            alt={""}
            w="full"
            h="auto"
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
            borderRadius="xl"
          />
          <Box>
            <Text color="#181411" fontSize="base" fontWeight="medium">
              {product.itemName}
            </Text>
            <Text color="#887563" fontSize="sm" fontWeight="normal">
              ${product.price}
            </Text>
          </Box>
        </Box>
      ))}
    </Grid>
  );
});

export default RebderItem;
