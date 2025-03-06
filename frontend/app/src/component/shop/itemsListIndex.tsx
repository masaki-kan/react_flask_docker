import { FC, useEffect, useState } from "react";
import { Box, Grid, Tag, VStack, Wrap, Image, Text } from "@chakra-ui/react";

const ItemsList: FC = () => {
  const [tagList, setTagList] = useState<Array<{ tagName: string }>>([]);
  const [itemList, setItemList] = useState<
    Array<{
      itemName: string;
      price: number;
      currency: string;
      image: string;
    }>
  >([]);

  useEffect(() => {
    const taglistDate = [
      { tagName: "All Women's Clothing" },
      { tagName: "Dresses" },
      { tagName: "Tops" },
      { tagName: "Jackets &amp; Coats" },
      { tagName: "Swim" },
      { tagName: "Pants" },
      { tagName: "Skirts" },
      { tagName: "Shorts" },
    ];

    const itemListData = [
      {
        itemName: "Vintage 70s Navy Blue Wool Coat",
        price: 8500,
        currency: "¥",
        image:
          "https://cdn.usegalileo.ai/sdxl10/b7dd176c-c822-4e72-998e-9b1575310749.png",
      },
      {
        itemName: "Vintage 90s Black &amp; White Striped Tee",
        price: 5000,
        currency: "¥",
        image:
          "https://cdn.usegalileo.ai/sdxl10/4f6e9eb1-9d0e-4435-9600-d63646766c03.png",
      },
      {
        itemName: "Vintage 80s Red &amp; White Polka Dot Skirt",
        price: 6000,
        currency: "¥",
        image:
          "https://cdn.usegalileo.ai/sdxl10/5b42b424-7e9e-4709-9c27-36575d515b37.png",
      },
      {
        itemName: "Vintage 90s Grunge Plaid Flannel Shirt",
        price: 9000,
        currency: "¥",
        image:
          "https://cdn.usegalileo.ai/sdxl10/783d7af6-179e-4116-a3b6-0fdd9ad99bcc.png",
      },
      {
        itemName: "Vintage 60s Boho Embroidered Blouse",
        price: 10000,
        currency: "¥",
        image:
          "https://cdn.usegalileo.ai/sdxl10/764d360f-7916-4467-8d3f-efd16e94bcd2.png",
      },
      {
        itemName: "Vintage 70s Hippie Bell Bottom Jeans",
        price: 11000,
        currency: "¥",
        image:
          "https://cdn.usegalileo.ai/sdxl10/60035669-fbc5-418e-91b7-48ed506344ba.png",
      },
    ];

    setItemList(itemListData);
    setTagList(taglistDate);
  }, []);

  return (
    <VStack align={"start"} mt={10}>
      <Wrap>
        {tagList.map((tag, index) => {
          return <Tag key={index}>{tag.tagName}</Tag>;
        })}
      </Wrap>
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
    </VStack>
  );
};

export default ItemsList;
