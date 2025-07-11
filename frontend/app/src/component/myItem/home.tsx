import { type FC } from "react";
import { Heading } from "@chakra-ui/react";
import ItemForm from "../form/itemForm";

const Home: FC = () => {
  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Register New Item
      </Heading>
      <ItemForm />
    </>
  );
};

export default Home;
