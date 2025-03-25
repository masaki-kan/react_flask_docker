import { type FC } from "react";
import { Heading } from "@chakra-ui/react";
import ItemForm from "../common/form/itemForm";

const Home: FC = () => {
  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "center", md: "justify" }}
      >
        Register New Item
      </Heading>
      <ItemForm />
    </>
  );
};

export default Home;
