import { type FC } from "react";
import ListingsIndex from "./listingsIndex";
import { Heading } from "@chakra-ui/react";

const Home: FC = () => {
  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "center", md: "justify" }}
      >
        Users
      </Heading>
      <ListingsIndex />
    </>
  );
};

export default Home;
