import { FC } from "react";
import { Container, Heading, Text } from "@chakra-ui/react";
import ItemsListIndex from "./itemsListIndex";

const Home: FC = () => {
  return (
    <>
      <>
        <Container maxW="container.xl">
          <Heading
            pl={{ md: 4, base: 0 }}
            textAlign={{ base: "center", md: "justify" }}
          >
            Women's Vintage Clothing
            <Text fontSize={"sm"} color="#887563" fontWeight="medium" mt={4}>
              22,000 items
            </Text>
          </Heading>

          <ItemsListIndex />
        </Container>
      </>
    </>
  );
};

export default Home;
